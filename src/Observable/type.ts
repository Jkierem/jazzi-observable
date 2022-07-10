import { Observable, Observer, Operator, Subscription, Scheduler } from "../_types"
import { getInternal, once, sequence } from "../_internals"
import { asyncScheduler, asapScheduler, syncScheduler } from "./schedulers"

type Fn<In extends any[], Out> = (...args: In) => Out
type Fn0<In> = Fn<[n: In], void>
type AnyFn = Fn<[any], any>
type AnyFn0 = Fn0<any>
type Signal = Fn<[], void>

const identityObserver = {
    next: <T>(x: T) => x,
    complete: () => {},
    error: <T>(x: T) => x,
}

type Cases = Record<"Observable", new (obserser: (obs: Observer) => () => void, scheduler?: Scheduler) => Observable<any>>

const ObservableType = () => (cases: Cases) => {
    cases.Observable.prototype.pipe = function(...ops: Operator<any, any>[]){
        return ops.reduce((observable,operator) => operator(observable),this)
    }
    
    cases.Observable.prototype.subscribe = function(next: AnyFn0, error: AnyFn0, complete: Signal){
      let observer: Observer;
      if( typeof next === "function"){
        observer = {
          next,
          complete: complete || identityObserver.complete,
          error: error || identityObserver.error,
        }
      } else {
        observer = next;
      }

      const unsub = once(this.get()({...identityObserver,...observer})) as any
      unsub.unsubscribe = unsub
      return unsub
    }
  
    cases.Observable.prototype.sequence = function(observable: Observable<any>){
      return new cases.Observable(obs => {
        let unsub2 = () => {}
        const unsub1 = this.subscribe({
          next: obs.next,
          complete: () => {
            unsub2 = observable.subscribe(obs)
          },
          error: obs.error
        });
  
        return () => {
          unsub1()
          unsub2()
        };
      })
    }
  
    cases.Observable.prototype.collect = function<A>(this: Observable<A>){
        return new cases.Observable((sub: any) => {
          const data = [] as A[];
          return this.subscribe({
            next: (d: A) => { data.push(d) },
            complete: () => {
              sub.next(data)
              sub.complete()
            },
            error: sub.error
          } as unknown as Observer<A>)
        })
    }
  
    cases.Observable.prototype.audit = function(auditor: Observable<any>){
      return new cases.Observable(sub => {
        let latest: any = undefined;
        const unsub = this.subscribe({
          next: (x: any) => latest = x,
        })
    
        const unsub2 = auditor.subscribe({
          next: () => sub.next(latest)
        })
    
        return () => {
          unsub()
          unsub2()
        }
      })
    }

    cases.Observable.prototype.auditTime = function(t: number){
      return this.audit(new cases.Observable(sub => {
        const id = window.setInterval(() => sub.next(undefined), t)
        return () => window.clearInterval(id)
      }))
    }
  
    cases.Observable.prototype.take = function(n: number){
      let i = 0;
      return new cases.Observable(sub => {
        const unsub = this.subscribe({
          next: (x: unknown) => {
            if( i < n ){
              i++;
              sub.next(x)
              if( i === n ){
                sub.complete()
                unsub()
              }
            } else {
              sub.complete()
              unsub()
            }
          },
          complete: sub.complete,
          error: sub.error
        })
        return unsub
      })
    }
  
    cases.Observable.prototype.takeWhile = function(pred: (n: any) => boolean){
      return new cases.Observable(sub => {
        let condition: boolean = true;
        const unsub = this.subscribe({
          next: (x: any) => {
            condition = condition && pred(x);
            if( condition ){
              sub.next(x)
            } else {
              sub.complete()
              unsub()
            }
          },
          complete: sub.complete,
          error: sub.error
        })
        return unsub
      })
    }
  
    cases.Observable.prototype.takeLast = function<A>(this: Observable<A>, n: number) {
      return new cases.Observable((sub: Observer<any>) => {
        const queue = [] as A[]
        const enqueue = (x: A) => {
          queue.push(x)
          if( queue.length > n ){
            queue.shift()
          }
        }
        let innerUnsub = () => {}
        
        const unsub = this.subscribe({
          next: enqueue,
          complete: () => {
            innerUnsub = new cases.Observable(sub => {
              for(let i = 0 ; i < queue.length; i++){
                sub.next(queue[i]);
              }
              sub.complete()
              return () => {}
            }).subscribe(sub)
          },
          error: sub.error
        } as Observer<A>)
        return () => {
          unsub();
          innerUnsub()
        }
      })
    }
  
    cases.Observable.prototype.takeUntil = function(observable: Observable<any>){
      return new cases.Observable(sub => {
        let run = true
        observable.subscribe({ next: () => run = false })
        const unsub = this.subscribe({
          next: (x: any) => {
            if( run ){
              sub.next(x)
            } else {
              sub.complete()
              unsub();
            }
          },
          complete: sub.complete,
          error: sub.error
        })
        return unsub
      })
    }
  
    cases.Observable.prototype.skip = function(n: number){
      let i = 0;
      return new cases.Observable(sub => {
        const unsub = this.subscribe({
          next: (x: any) => {
            if( i < n ){
              i++;
            } else {
              sub.next(x)
            }
          },
          complete: sub.complete,
          error: sub.error
        })
        return unsub
      })
    }

    cases.Observable.prototype.mergeAll = function(){
      let unsubs = [] as Subscription[];
      return new cases.Observable(sub => {
        const unsub = this.subscribe({
          ...sub,
          next: (x: any) => {
            const cleanup = x.subscribe({ next: getInternal(sub as any).next })
            unsubs.push(cleanup)
          },
        })
        unsubs.push(unsub);
        return () => unsubs.forEach(fn => fn())
      })
    }

    cases.Observable.prototype.mergeMap = function(fn: AnyFn){
      return this.map(fn).mergeAll()
    }

    cases.Observable.prototype.concatAll = function<A>(this: Observable<Observable<A>>){
      const unsubs = new Set()
      const queue = [] as Observable<any>[]

      const sequenceObservable = (x: any, sub: any) => {
        const unsub = x.subscribe({
          next: getInternal(sub).next,
          error: getInternal(sub).error,
          complete: () => {
            unsubs.delete(unsub)
            const nextObs = queue.shift();
            if(unsubs.size === 0 && nextObs){
              sequenceObservable(nextObs,sub)
            }
          }
        })
        unsubs.add(unsub)
      }

      return new cases.Observable(sub => {
        const unsub = this.subscribe({
          ...sub,
          next: (x) => {
            if( unsubs.size !== 0 ){
              queue.push(x)
            } else {
              sequenceObservable(x,sub)
            }
          }
        })
        return () => {
          unsub();
          unsubs.forEach((fn: any) => fn())
        }
      })
    }

    cases.Observable.prototype.concatMap = function(fn: AnyFn){
      return this.map(fn).concatAll();
    }

    cases.Observable.prototype.switchAll = function(){
      let current: any = undefined

      const sequenceObservable = (x: any, sub: any) => {
        const unsub = x.subscribe({
          next: (x: any) => { 
            getInternal(sub).next(x);
            if( current !== unsub ){
              current?.();
              current = unsub;
            }
          },
          error: getInternal(sub).error
        })
        current = unsub;
      }

      return new cases.Observable(sub => {
        const unsub = this.subscribe({
          ...sub,
          next: (x: any) => {
            current?.()
            sequenceObservable(x,sub)
          }
        })
        return () => {
          unsub();
          current?.()
        }
      })
    }

    cases.Observable.prototype.switchMap = function(fn: AnyFn){
      return this.map(fn).switchAll()
    }

    cases.Observable.prototype.exhaust = function(){
      let current: any = undefined

      return new cases.Observable((sub: any) => {
        const unsub = this.subscribe({
          ...sub,
          next: (x: any) => {
            if( !current ){
              const unsub = x.subscribe({
                next: getInternal(sub).next,
                error: getInternal(sub).error,
                complete: () => current = undefined,
              })
              current = unsub;
            }
          }
        })
        return () => {
          unsub();
          current?.()
        }
      })
    }

    cases.Observable.prototype.exhaustMap = function(fn: AnyFn){
      return this.map(fn).exhaust();
    }

    cases.Observable.prototype.combineAll = function(){
      return new cases.Observable((sub: any) => {
        const observables = [] as Observable<any>[]
        const unsubs = [] as Subscription[]

        this.subscribe({
          next: (x: any) => observables.push(x),
          error: sub.error,
          complete: () => {
            const latest = observables.map(() => undefined);
            const called = observables.map(() => false);
            observables.forEach((obs,idx) => {
              const unsub = obs.subscribe({
                next: (x) => {
                  latest[idx] = x;
                  called[idx] = true;
                  if( called.every(x => x) ){
                    getInternal(sub).next(latest)
                  }
                }
              })
              unsubs.push(unsub)
            })
          }
        })

        return () => unsubs.forEach(fn => fn())
      })
    }

    cases.Observable.prototype.withLatestFrom = function(obs: Observable<any>){
      return new cases.Observable(sub => {
        let latest: any = undefined
        let emitted = false;
        const unsubs = [] as Subscription[]
        unsubs.push(obs.subscribe({
          next: (x) => {
            emitted = true;
            latest = x
          },
          error: sub.error
        }))
        unsubs.push(this.subscribe({
          ...sub,
          next: (x: any) => {
            if( emitted ){
              sub.next([x,latest])
            }
          } 
        }))

        return () => unsubs.forEach(fn => fn())
      })
    }

    cases.Observable.prototype.async = function(){
      return new cases.Observable(getInternal(this.get()), asyncScheduler)
    }

    cases.Observable.prototype.asap = function(){
      return new cases.Observable(getInternal(this.get()), asapScheduler)
    }

    cases.Observable.prototype.sync = function(){
      return new cases.Observable(getInternal(this.get()), syncScheduler)
    }

    cases.Observable.prototype.mapTo = function(value: any){
      return this.map(() => value)
    }

    cases.Observable.prototype.cleanup = function(cleanup: AnyFn){
      return new cases.Observable((sub: any) => {
        const original = this.subscribe(getInternal(sub))
        return sequence(original, () => cleanup(sub));
      })
    }

    cases.Observable.prototype.after = function(after: AnyFn){
      return new cases.Observable((sub: any) => {
        const { next, error, complete: original } = getInternal(sub);
        return this.subscribe({
          next,
          error,
          complete: sequence(original, after)
        })
      })
    }

    cases.Observable.prototype.error = function(fn: AnyFn){
      return new cases.Observable((sub: any) => {
        const { next, error: original, complete } = getInternal(sub);
        return this.subscribe({
          next,
          error: sequence(original,fn),
          complete,
        })
      })
    }

    cases.Observable.prototype.catchError = function(fn: Fn<any[], any>){
      return new cases.Observable((sub: any) => {
        const { next, error, complete } = getInternal(sub);
        let innerCleanup = (x: any) => x;
        const outerCleanup = this.subscribe({
          next,
          error: (err: unknown) => {
            error(err);
            innerCleanup = fn(err,this).subscribe(getInternal(sub))
          },
          complete,
        })
        return sequence(innerCleanup,outerCleanup);
      })
    }
}

export default ObservableType;