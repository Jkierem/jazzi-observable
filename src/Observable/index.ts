import { Union, Functor, Filterable, Tap, Monad, Thenable } from "jazzi"
import { Internal, once } from "../_internals"
import ObservableType from './type'
import * as schedulers from './schedulers'
import * as operators from './operators'

import type { Observable, ObservableRep } from '../_types'

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
      Observable(this: Observable<any>, fn){
        return this.mergeMap(fn)
      }
    },
    join: {
      Observable(this: Observable<any>){
        return this.mergeAll();
      }
    },
    run: {
      Observable(this: Observable<any>,...args){
        return this.subscribe(...args)
      }
    },
    fmap: {
      Observable(this: Observable<any>, fn){
        return ObservableR.Observable(sub => {
          return this.subscribe({
            next: (x) => sub.next(fn(x)),
            complete: () => sub.complete(),
            error: (e) => sub.error(e)
          })
        })
      }
    },
    filter: {
      Observable(this: Observable<any>, pred){
        return ObservableR.Observable(sub => {
          return this.subscribe({
            next: (x) => pred(x) && sub.next(x),
            complete: () => sub.complete(),
            error: (e) => sub.error(e)
          })
        })
      }
    },
    toThenable: {
      Observable(this: Observable<any>){
        return {
          then: (onRes, onRej) => {
            const resolveOnce = once(onRes)
            this.take(1).subscribe(resolveOnce, onRej, resolveOnce)
          },
          catch(onRej){
            this.then(x => x, onRej)
          }
        }
      }
    },
    toPromise: {
      Observable(this: Observable<any>){
        return new Promise((res,rej) => this.take(1).subscribe(res,rej,res as any))
      }
    }
  }
}

const fromArrayImpl = (self: any, xs: any, scheduler?: any) => {
  return self.Observable(sub => {
    try {
      xs.forEach(x => sub.next(x))
      sub.complete()
    } catch(e) {
      sub.error(e)
    }
  },scheduler)
}

const ObservableR: any = Union({
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
    from(this: any, fn: any, scheduler?: any){
      return this.Observable(fn,scheduler)
    },
    fromPromise(this: any, p){
      return this.Observable(sub => {
        p
        .then(sub.next)
        .catch(sub.error)
        .finally(sub.complete)
      })
    },
    fromArray(this: any, xs: any[],scheduler?: any){ 
       return fromArrayImpl(this,xs,scheduler)
    },
    fromEvent(this:any, target: any, event?: any){
      return this.Observable(sub => {
        const handler = e => sub.next(e)
        target.addEventListener(event,handler)
        return () => target.removeEventListener(event,handler)
      })
    },
    interval(this: any, n: number, fn=x=>x){
      return this.Observable(sub => {
        let i = 0
        const id = setInterval(() => {
          sub.next(fn(i))
          i++;
        },n)
        return () => clearInterval(id)
      })
    },
    throwError(this:any, err){ 
      return this.Observable(sub => sub.error(typeof err === "function" ? err() : err)) 
    },
    complete(this:any){ 
      return this.Observable(sub => sub.complete()) 
    }
  },
})

ObservableR.operators = operators
ObservableR.schedulers = schedulers

export default ObservableR as ObservableRep;