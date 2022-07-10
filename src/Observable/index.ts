import { Union, Functor, Filterable, Tap, Monad, Thenable } from "jazzi"
import { Internal, once } from "../_internals"
import ObservableType from './type'
import * as schedulers from './schedulers'
import * as operators from './operators'

import type { Observable, ObservableRep, Observer } from '../_types'

const { syncScheduler } = schedulers

const wrapObserver = (observer: any, scheduler=syncScheduler) => {
  let running = true;
  return {
    get [Internal](){
      return observer
    },
    unsubscribe(cleanup: () => void){ 
      running = false;
      if( typeof cleanup === "function" ){
        cleanup();
      }
    },
    next(...args: any[]){
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
    error(...args: any[]){
      if( running ){
        scheduler.runTask(() => {
          running = false;
          observer.error(...args)
        });
      }
    }
  }
}
const createWrapper = (subFn: any, scheduler: any) => {
  const subscribe = (observer: any) => {
    const wrapper = wrapObserver(observer,scheduler);
    const cleanup = subFn(wrapper);
    return () => wrapper.unsubscribe(cleanup)
  }
  ;(subscribe as any)[Internal] = subFn
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
      Observable(this: Observable<any>, fn: any){
        return this.mergeMap(fn)
      }
    },
    join: {
      Observable(this: Observable<any>){
        return this.mergeAll();
      }
    },
    run: {
      Observable(this: Observable<any>, ...args: any[]){
        return this.subscribe(...args)
      }
    },
    fmap: {
      Observable(this: Observable<any>, fn: any){
        return ObservableR.Observable((sub: Observer<any>) => {
          return this.subscribe({
            next: (x) => sub.next(fn(x)),
            complete: () => sub.complete(),
            error: (e) => sub.error(e)
          })
        })
      }
    },
    filter: {
      Observable(this: Observable<any>, pred: (a: any) => boolean){
        return ObservableR.Observable((sub: Observer<any>) => {
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
          then: (onRes: (x: any) => void, onRej: () => void) => {
            const resolveOnce = once(onRes) as () => void
            this.take(1).subscribe(resolveOnce, onRej, resolveOnce)
          },
          catch(onRej: () => void){
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
  return self.Observable((sub: Observer<any>) => {
    try {
      xs.forEach((x: any) => sub.next(x))
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
      return this.Observable((sub: { next: any; error: any; complete: any }) => {
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
      return this.Observable((sub: { next: (arg0: any) => any }) => {
        const handler = (e: unknown) => sub.next(e)
        target.addEventListener(event,handler)
        return () => target.removeEventListener(event,handler)
      })
    },
    interval(this: any, n: number, fn=(x: unknown)=>x){
      return this.Observable((sub: { next: (arg0: any) => void }) => {
        let i = 0
        const id = setInterval(() => {
          sub.next(fn(i))
          i++;
        },n)
        return () => clearInterval(id)
      })
    },
    throwError(this:any, err){ 
      return this.Observable((sub: { error: (arg0: any) => any }) => sub.error(typeof err === "function" ? err() : err)) 
    },
    complete(this:any){ 
      return this.Observable((sub: { complete: () => any }) => sub.complete()) 
    }
  },
})

ObservableR.operators = operators
ObservableR.schedulers = schedulers

export default ObservableR as ObservableRep;