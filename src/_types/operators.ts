import type { Observable, Operator, Observer } from '.'

export interface Operators {
    /**
     * Returns a new observable that runs both observable in order.
     * @param nextObservable
     */
    sequence: <A,B>(nextObs: Observable<A>) => Operator<B,A|B>;
    /**
     * Returns a new observable that collects all the next calls in an array, calling next
     * with the array when the observable completes. *The source observable must complete*
     */
    collect: <A>() => Operator<A, A[]>;
    /**
     * Returns a new observable with an auditor. The auditor defines when the observer gets notified
     * with the latest value of the audited observable. This function makes more sense if both 
     * observables are async.
     * @param auditor 
     */
    audit: <A>(auditor: Observable<any>) => Operator<A,A>;
    /**
     * Returns a new observable with an auditor that is based on a timing to notify the observer
     * @param t time between audits/next calls
     */
    auditTime: <A>(n: number) => Operator<A,A>;
    /**
     * Returns a new observable that runs an effect everytime it emits without altering the value. Used to run effects
     * @param eff function to call on next
     */
    tap: <A>(fn: (a: A) => void) => Operator<A,A>;
    /**
     * Returns a new observable that completes after `n` next calls or until complete is called on it.
     */
    take: <A>(n: number) => Operator<A,A>;
    /**
     * Returns a new observable that runs while a condition holds and completes when that condition is not met.
     * @param predicate 
     */
    takeWhile: <A>(predicate: (a: A) => boolean) => Operator<A,A>;
    /**
     * Returns a new observable that collects the last n calls to next in an array. *Requires the observable to complete* 
     * @param n number of calls to next
     */
    takeLast: <A>(n: number) => Operator<A,A>;
    /**
     * Returns a new observable that returns the same values as the source observable until the other observable returns
     * @param stop 
     */
    takeUntil: <A>(stop: Observable<any>) => Operator<A,A>;
    /**
     * Returns a new observable that ignores the first n calls to next.
     * @param skips 
     */
    skip: <A>(skips: number) => Operator<A,A>;
    /**
     * Returns a new flat observable that returns all the emitted values of the emitted observables. 
     * Must be called on an observable of observables
     */
    mergeAll: <A>() => Operator<Observable<A>,A>;
    /**
     * Returns a new observable that flattens all the observables created with `fn`
     * using mergeAll
     * @param fn 
     */
    mergeMap: <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
    /**
     * Returns a new observable that is the sequence of all emitted observables. 
     * No observables starts before the previous has completed 
     */
    concatAll: <A>() => Operator<Observable<A>,A>;
    /**
     * Returns a new observable that combines all emitted observables using concatAll
     * @param fn 
     */
    concatMap: <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
    /**
     * Returns a new observable that is the sequence of all emitted observables. 
     * If an observable starts before the previous completes, then the previous is
     * unsubscribed. 
     */
    switchAll: <A>() => Operator<Observable<A>,A>;
    /**
     * Returns a new observable that combines all emitted observables using switchAll
     * @param fn 
     */
    switchMap: <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
    /**
     * Returns a new observables that combines all emitted observables by ignoring emitted
     * values from other observables while the current observable is executing. When that observable
     * completes then it will allow another observable to emit values and take the place of current
     * observable. If an observable starts while another is executing, then that observable is skipped.
     */
    exhaust: <A>() => Operator<Observable<A>,A>;
    /**
     * Returns a new observable that combines all emitted observables using exhaust
     * @param fn 
     */
    exhaustMap: <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
    /**
     * Returns a new observable than flattens all emitted observables by collecting all emitted 
     * values in an array. It waits for all observables to be created and then every time one
     * observable emits, it emits an array of all the latest values
     */
    combineAll: <A>() => Operator<Observable<A>,A[]>;
    /**
     * Returns a new observable that emits the latest values of both observables
     * @param other 
     */
    withLatestFrom: <A,B>(other: Observable<B>) => Operator<A,[A,B]>;
    /**
     * Returns a new observable with an async scheduler
     */
    async: <A>() => Operator<A,A>;
    /**
     * Returns a new observable with an asap scheduler
     */
    asap: <A>() => Operator<A,A>;
    /**
     * Returns a new observable with an sync scheduler
     */
    sync: <A>() => Operator<A,A>;
    /**
     * Maps all emitted values to a single value
     * @param fn 
     */
    mapTo: <A,B>(data: B) => Operator<A,B>;
    /**
     * Maps an observable
     * @param fn 
     */
    map: <A,B>(fn: (a: A) => B) => Operator<A,B>;
    /**
     * Maps an observable
     * @param fn 
     */
    fmap: <A,B>(fn: (a: A) => B) => Operator<A,B>;
    /**
     * Returns a new observable that only emits values that pass the predicate
     * @param predicate 
     */
    filter: <A>(predicate: (data: A) => boolean) => Operator<A,A>;
    /**
     * Returns a new observable that flattens all the observables created with `fn`
     * using mergeAll
     * @param fn 
     */
    bind: <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
    /**
     * Returns a new observable that flattens all the observables created with `fn`
     * using mergeAll
     * @param fn 
     */
    chain: <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
    /**
     * Returns a new observable that flattens all the observables created with `fn`
     * using mergeAll
     * @param fn 
     */
    flatMap: <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
    /**
     * Returns a new observable that runs an effect everytime it emits without altering the value. Used to run effects
     * @param eff function to call on next
     */
    effect: <A>(fn: (a: A) => void) => Operator<A,A>;
    /**
     * Returns a new observable that runs an effect everytime it emits without altering the value. Used to run effects
     * @param eff function to call on next
     */
    peak: <A>(fn: (a: A) => void) => Operator<A,A>;
    /**
     * Returns a new flat observable that returns all the emitted values of the emitted observables. 
     * Must be called on an observable of observables
     */
    flat: <A>() => Operator<Observable<A>,A>;
    /**
     * Returns a new flat observable that returns all the emitted values of the emitted observables. 
     * Must be called on an observable of observables
     */
    join: <A>() => Operator<Observable<A>,A>;
    /**
     * Returns a new observable that will call the passed function on unsubscribe, after the original unsubscribe callback if any.
     * Receives the observer to trigger extra events on unsubscribe. It is still subject to normal observable contract constraints
     * @param fn 
     */
    cleanup: <A>(fn: (observer: Observer<A>) => void) => Operator<A,A>;
    /**
     * Returns a new observable that will call the passed function on complete, after the original complete callback if any.
     * @param fn 
     */
    after: <A>(fn: () => void) => Operator<A,A>;
    /**
     * Returns a new observable that will call the passed function on error, after the original error callback if any.
     * @param fn 
     */
    error: <A>(fn: (e: any) => void) => Operator<A,A>;
    /**
     * Returns a new observable that on error, will used to passed function run a new observable. The function receives the original 
     * observable for retrying
     * @param fn 
     */
    catchError: <A>(fn: (e: any, observable: Observable<A>) => void) => Operator<A,A>;
}
