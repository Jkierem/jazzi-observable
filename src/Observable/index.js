import { Union, Functor, Filterable, Tap, Monad, Thenable } from "jazzi"
import { Internal } from "../_internals"
import ObservableType from './type'
import * as schedulers from './schedulers'
import * as operators from './operators'

const { syncScheduler } = schedulers

const wrapObserver = (observer,scheduler=syncScheduler) => {
  let running = true;
  return {
    get [Internal](){
      return observer
    },
    unsubscribe(cleanup){ 
      running = false;
      if( typeof cleanup === "function" ){
        cleanup();
      }
    },
    next(...args){
      if( running ){
        scheduler.runTask(() => observer.next(...args));
      }
    },
    complete(){
      if( running ){
        scheduler.runTask(() => {
          running = false;
          observer.complete()
        })
      }
    },
    error(...args){
      if( running ){
        scheduler.runTask(() => {
          running = false;
          observer.error(...args)
        });
      }
    }
  }
}
const createWrapper = (subFn,scheduler) => {
  const subscribe = (observer) => {
    const wrapper = wrapObserver(observer,scheduler);
    const cleanup = subFn(wrapper);
    return () => wrapper.unsubscribe(cleanup)
  }
  subscribe[Internal] = subFn
  return subscribe
}

const defs = {
  trivials: [],
  identities: [],
  resolve: [],
  reject: [],
  pure: "Observable",
  remove: {
    natural: true,
    matchEffect: true,
  },
  overrides: {
    chain: {
      Observable(fn){
        return this.mergeMap(fn)
      }
    },
    join: {
      Observable(){
        return this.mergeAll();
      }
    },
    run: {
      Observable(...args){
        return this.subscribe(...args)
      }
    },
    fmap: {
      Observable(fn){
        return Observable.Observable(sub => {
          return this.subscribe({
            next: (x) => sub.next(fn(x)),
            complete: () => sub.complete(),
            error: (e) => sub.error(e)
          })
        })
      }
    },
    filter: {
      Observable(pred){
        return Observable.Observable(sub => {
          return this.subscribe({
            next: (x) => pred(x) && sub.next(x),
            complete: () => sub.complete(),
            error: (e) => sub.error(e)
          })
        })
      }
    },
    toPromise: {
      Observable(){
        return new Promise((res,rej) => this.take(1).subscribe(res,rej,res))
      }
    }
  }
}

const fromArrayImpl = (self,xs,scheduler) => {
  return self.Observable(sub => {
    try {
      xs.forEach(x => sub.next(x))
      sub.complete()
    } catch(e) {
      sub.error(e)
    }
  },scheduler)
}

const Observable = Union({
  name: "Observable",
  cases: {
    Observable: (fn,scheduler=syncScheduler) => createWrapper(fn,scheduler)
  },
  extensions:[
    ObservableType(),
    Functor(defs),
    Filterable(defs),
    Monad(defs),
    Tap({ trivials: ["Observable"] }),
    Thenable(defs)
  ],
  config: {
    noHelpers: true
  },
  constructors: {
    of(...xs){
      return fromArrayImpl(this,xs)
    },
    from(fn,scheduler){
      return this.Observable(fn,scheduler)
    },
    fromPromise(p){
      return this.Observable(sub => {
        p
        .then(sub.next)
        .catch(sub.error)
        .finally(sub.complete)
      })
    },
    fromArray(xs,scheduler){ 
       return fromArrayImpl(this,xs,scheduler)
    },
    fromEvent(target,event){
      return this.Observable(sub => {
        const handler = e => sub.next(e)
        target.addEventListener(event,handler)
        return () => target.removeEventListener(event,handler)
      })
    },
    interval(n,fn=x=>x){
      return this.Observable(sub => {
        let i = 0
        const id = setInterval(() => {
          sub.next(fn(i))
          i++;
        },n)
        return () => clearInterval(id)
      })
    },
    throwError(err){ 
      return this.Observable(sub => sub.error(typeof err === "function" ? err() : err)) 
    },
    complete(){ 
      return this.Observable(sub => sub.complete()) 
    }
  },
})

Observable.operators = operators
Observable.schedulers = schedulers

export default Observable;