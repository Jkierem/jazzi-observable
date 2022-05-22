import type { Observable, Operator, Observer } from "./mod.ts"

/**
 * Returns a new observable that runs both observable in order.
 * @param nextObservable
 */
export declare const sequence: <A,B>(nextObs: Observable<A>) => Operator<B,A|B>;
/**
 * Returns a new observable that collects all the next calls in an array, calling next
 * with the array when the observable completes. *The source observable must complete*
 */
export declare const collect: <A>() => Operator<A, A[]>;
/**
 * Returns a new observable with an auditor. The auditor defines when the observer gets notified
 * with the latest value of the audited observable. This function makes more sense if both 
 * observables are async.
 * @param auditor 
 */
export declare const audit: <A>(auditor: Observable<any>) => Operator<A,A>;
/**
 * Returns a new observable with an auditor that is based on a timing to notify the observer
 * @param t time between audits/next calls
 */
export declare const auditTime: <A>(n: number) => Operator<A,A>;
/**
 * Returns a new observable that runs an effect everytime it emits without altering the value. Used to run effects
 * @param eff function to call on next
 */
export declare const tap: <A>(fn: (a: A) => void) => Operator<A,A>;
/**
 * Returns a new observable that completes after `n` next calls or until complete is called on it.
 */
export declare const take: <A>(n: number) => Operator<A,A>;
/**
 * Returns a new observable that runs while a condition holds and completes when that condition is not met.
 * @param predicate 
 */
export declare const takeWhile: <A>(predicate: (a: A) => boolean) => Operator<A,A>;
/**
 * Returns a new observable that collects the last n calls to next in an array. *Requires the observable to complete* 
 * @param n number of calls to next
 */
export declare const takeLast: <A>(n: number) => Operator<A,A>;
/**
 * Returns a new observable that returns the same values as the source observable until the other observable returns
 * @param stop 
 */
export declare const takeUntil: <A>(stop: Observable<any>) => Operator<A,A>;
/**
 * Returns a new observable that ignores the first n calls to next.
 * @param skips 
 */
export declare const skip: <A>(skips: number) => Operator<A,A>;
/**
 * Returns a new flat observable that returns all the emitted values of the emitted observables. 
 * Must be called on an observable of observables
 */
export declare const mergeAll: <A>() => Operator<Observable<A>,A>;
/**
 * Returns a new observable that flattens all the observables created with `fn`
 * using mergeAll
 * @param fn 
 */
export declare const mergeMap: <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
/**
 * Returns a new observable that is the sequence of all emitted observables. 
 * No observables starts before the previous has completed 
 */
export declare const concatAll: <A>() => Operator<Observable<A>,A>;
/**
 * Returns a new observable that combines all emitted observables using concatAll
 * @param fn 
 */
export declare const concatMap: <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
/**
 * Returns a new observable that is the sequence of all emitted observables. 
 * If an observable starts before the previous completes, then the previous is
 * unsubscribed. 
 */
export declare const switchAll: <A>() => Operator<Observable<A>,A>;
/**
 * Returns a new observable that combines all emitted observables using switchAll
 * @param fn 
 */
export declare const switchMap: <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
/**
 * Returns a new observables that combines all emitted observables by ignoring emitted
 * values from other observables while the current observable is executing. When that observable
 * completes then it will allow another observable to emit values and take the place of current
 * observable. If an observable starts while another is executing, then that observable is skipped.
 */
export declare const exhaust: <A>() => Operator<Observable<A>,A>;
/**
 * Returns a new observable that combines all emitted observables using exhaust
 * @param fn 
 */
export declare const exhaustMap: <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
/**
 * Returns a new observable than flattens all emitted observables by collecting all emitted 
 * values in an array. It waits for all observables to be created and then every time one
 * observable emits, it emits an array of all the latest values
 */
export declare const combineAll: <A>() => Operator<Observable<A>,A[]>;
/**
 * Returns a new observable that emits the latest values of both observables
 * @param other 
 */
export declare const withLatestFrom: <A,B>(other: Observable<B>) => Operator<A,[A,B]>;
/**
 * Returns a new observable with an async scheduler
 */
export declare const async: <A>() => Operator<A,A>;
/**
 * Returns a new observable with an asap scheduler
 */
export declare const asap: <A>() => Operator<A,A>;
/**
 * Returns a new observable with an sync scheduler
 */
export declare const sync: <A>() => Operator<A,A>;
/**
 * Maps all emitted values to a single value
 * @param fn 
 */
export declare const mapTo: <A,B>(data: B) => Operator<A,B>;
/**
 * Maps an observable
 * @param fn 
 */
export declare const map: <A,B>(fn: (a: A) => B) => Operator<A,B>;
/**
 * Maps an observable
 * @param fn 
 */
export declare const fmap: <A,B>(fn: (a: A) => B) => Operator<A,B>;
/**
 * Returns a new observable that only emits values that pass the predicate
 * @param predicate 
 */
export declare const filter: <A>(predicate: (data: A) => boolean) => Operator<A,A>;
/**
 * Returns a new observable that flattens all the observables created with `fn`
 * using mergeAll
 * @param fn 
 */
export declare const bind: <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
/**
 * Returns a new observable that flattens all the observables created with `fn`
 * using mergeAll
 * @param fn 
 */
export declare const chain: <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
/**
 * Returns a new observable that flattens all the observables created with `fn`
 * using mergeAll
 * @param fn 
 */
export declare const flatMap: <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
/**
 * Returns a new observable that runs an effect everytime it emits without altering the value. Used to run effects
 * @param eff function to call on next
 */
export declare const effect: <A>(fn: (a: A) => void) => Operator<A,A>;
/**
 * Returns a new observable that runs an effect everytime it emits without altering the value. Used to run effects
 * @param eff function to call on next
 */
export declare const peak: <A>(fn: (a: A) => void) => Operator<A,A>;
/**
 * Returns a new flat observable that returns all the emitted values of the emitted observables. 
 * Must be called on an observable of observables
 */
export declare const flat: <A>() => Operator<Observable<A>,A>;
/**
 * Returns a new flat observable that returns all the emitted values of the emitted observables. 
 * Must be called on an observable of observables
 */
export declare const join: <A>() => Operator<Observable<A>,A>;
/**
 * Returns a new observable that will call the passed function on unsubscribe, after the original unsubscribe callback if any.
 * Receives the observer to trigger extra events on unsubscribe. It is still subject to normal observable contract constraints
 * @param fn 
 */
export declare const cleanup: <A>(fn: (observer: Observer<A>) => void) => Operator<A,A>;
/**
 * Returns a new observable that will call the passed function on complete, after the original complete callback if any.
 * @param fn 
 */
export declare const after: <A>(fn: () => void) => Operator<A,A>;
/**
 * Returns a new observable that will call the passed function on error, after the original error callback if any.
 * @param fn 
 */
export declare const error: <A>(fn: (e: any) => void) => Operator<A,A>;
/**
 * Returns a new observable that on error, will used to passed function run a new observable. The function receives the original 
 * observable for retrying
 * @param fn 
 */
export declare const catchError: <A>(fn: (e: any, observable: Observable<A>) => void) => Operator<A,A>;