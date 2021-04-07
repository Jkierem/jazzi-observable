import { getInternal } from "../_internals"
import { asyncScheduler, asapScheduler, syncScheduler } from "./schedulers"

const identityObserver = {
    next: x => x,
    complete: () => {},
    error: x => x,
}

const ObservableType = () => (cases,globals) => {
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

      return this.get()({...identityObserver,...observer})
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
  
    cases.Observable.prototype.collect = function(){
        return new cases.Observable(sub => {
          const data = [];
          return this.subscribe({
            next: (d) => data.push(d),
            complete: () => {
              sub.next(data)
              sub.complete()
            },
            error: sub.error
          })
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
        let i = 0
        const id = window.setInterval(() => {
          sub.next(fn(i))
          i++;
        },n)
        return () => window.clearInterval(id)
      }))
    }
  
    cases.Observable.prototype.tap = function(eff){
      return this.effect(eff)
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
        let condition = true;
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
  
    cases.Observable.prototype.takeLast = function(n) {
      return new cases.Observable(sub => {
        const queue = []
        const enqueue = x => {
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
        })
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
      let unsubs = []
      return new cases.Observable(sub => {
        const unsub = this.subscribe({
          ...sub,
          next: (x) => {
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

    cases.Observable.prototype.concatAll = function(){
      const unsubs = new Set()
      const queue = []

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
          unsubs.forEach(fn => fn())
        }
      })
    }

    cases.Observable.prototype.concatMap = function(fn){
      return this.map(fn).concatAll();
    }

    cases.Observable.prototype.switchAll = function(){
      let current = undefined

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
      let current = undefined

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
        const observables = []
        const unsubs = []

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
        const unsubs = []
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
}

export default ObservableType;