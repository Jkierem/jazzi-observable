import { Observable, Observer, Subscription } from "../_types"
import { getInternal, once, sequence } from "../_internals"
import { asyncScheduler, asapScheduler, syncScheduler } from "./schedulers"

const identityObserver = {
    next: x => x,
    complete: () => {},
    error: x => x,
}

const ObservableType = () => (cases,_globals) => {
    cases.Observable.prototype.pipe = function(...ops){
        return ops.reduce((observable,operator) => operator(observable),this)
    }
    
    cases.Observable.prototype.subscribe = function(next,error,complete){
      let observer;
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
  
    cases.Observable.prototype.sequence = function(observable){
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
  
    cases.Observable.prototype.audit = function(auditor){
      return new cases.Observable(sub => {
        let latest = undefined;
        const unsub = this.subscribe({
          next: (x) => latest = x,
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

    cases.Observable.prototype.auditTime = function(t){
      return this.audit(new cases.Observable(sub => {
        const id = window.setInterval(() => sub.next(),t)
        return () => window.clearInterval(id)
      }))
    }
  
    cases.Observable.prototype.take = function(n){
      let i = 0;
      return new cases.Observable(sub => {
        const unsub = this.subscribe({
          next: (x) => {
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
  
    cases.Observable.prototype.takeWhile = function(pred){
      return new cases.Observable(sub => {
        let condition: any = true;
        const unsub = this.subscribe({
          next: (x) => {
            condition &= pred(x);
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
  
    cases.Observable.prototype.takeUntil = function(observable){
      return new cases.Observable(sub => {
        let run = true
        observable.subscribe({ next: () => run = false })
        const unsub = this.subscribe({
          next: (x) => {
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
  
    cases.Observable.prototype.skip = function(n){
      let i = 0;
      return new cases.Observable(sub => {
        const unsub = this.subscribe({
          next: (x) => {
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
            const cleanup = x.subscribe({ next: getInternal(sub).next })
            unsubs.push(cleanup)
          },
        })
        unsubs.push(unsub);
        return () => unsubs.forEach(fn => fn())
      })
    }

    cases.Observable.prototype.mergeMap = function(fn){
      return this.map(fn).mergeAll()
    }

    cases.Observable.prototype.concatAll = function<A>(this: Observable<Observable<A>>){
      const unsubs = new Set()
      const queue = [] as Observable<any>[]

      const sequenceObservable = (x,sub) => {
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

    cases.Observable.prototype.concatMap = function(fn){
      return this.map(fn).concatAll();
    }

    cases.Observable.prototype.switchAll = function(){
      let current: any = undefined

      const sequenceObservable = (x,sub) => {
        const unsub = x.subscribe({
          next: (x) => { 
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
          next: (x) => {
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

    cases.Observable.prototype.switchMap = function(fn){
      return this.map(fn).switchAll()
    }

    cases.Observable.prototype.exhaust = function(){
      let current: any = undefined

      return new cases.Observable(sub => {
        const unsub = this.subscribe({
          ...sub,
          next: (x) => {
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

    cases.Observable.prototype.exhaustMap = function(fn){
      return this.map(fn).exhaust();
    }

    cases.Observable.prototype.combineAll = function(){
      return new cases.Observable(sub => {
        const observables = [] as Observable<any>[]
        const unsubs = [] as Subscription[]

        this.subscribe({
          next: x => observables.push(x),
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

    cases.Observable.prototype.withLatestFrom = function(obs){
      return new cases.Observable(sub => {
        let latest = undefined
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
          next: (x) => {
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

    cases.Observable.prototype.mapTo = function(value){
      return this.map(() => value)
    }

    cases.Observable.prototype.cleanup = function(cleanup){
      return new cases.Observable((sub) => {
        const original = this.subscribe(getInternal(sub))
        return sequence(original, () => cleanup(sub));
      })
    }

    cases.Observable.prototype.after = function(after){
      return new cases.Observable((sub) => {
        const { next, error, complete: original } = getInternal(sub);
        return this.subscribe({
          next,
          error,
          complete: sequence(original, after)
        })
      })
    }

    cases.Observable.prototype.error = function(fn){
      return new cases.Observable((sub) => {
        const { next, error: original, complete } = getInternal(sub);
        return this.subscribe({
          next,
          error: sequence(original,fn),
          complete,
        })
      })
    }

    cases.Observable.prototype.catchError = function(fn){
      return new cases.Observable((sub) => {
        const { next, error, complete } = getInternal(sub);
        let innerCleanup = x => x;
        const outerCleanup = this.subscribe({
          next,
          error: (err) => {
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