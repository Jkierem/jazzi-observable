import { Thenable, ThenableOf } from 'jazzi/dist/Union/thenable';

export type Scheduler = {
    runTask: (fn: () => void) => void;
}

export interface Subscription {
    (): void
    unsubscribe(): void
}

export type Operator<T,U> = (inputObservable: Observable<T>) => Observable<U>;

export type Observer<T=unknown, E=unknown> = {
    next: (...args: [T] extends [never] ? [] : [n: T]) => void;
    complete: () => void;
    error: (...e: [E] extends [never] ? []: [e: E]) => void;
}

export type PartialObserver<T=unknown, E=unknown> = {
    next: (...args: [T] extends [never] ? [] : [n: T]) => void;
    complete?: () => void;
    error?: (...e: [E] extends [never] ? []: [e: E]) => void;
}

export type PartialEventTarget<T> = {
    addEventListener: (event: string, handler: (e: T) => void) => void;
    removeEventListener: (event: string, handler: (e: T) => void) => void;
}

export interface Observable<A,E = unknown> extends Thenable<A, E> {
    /**
     * Subscribes to an observable starting its' excecution.
     */
    run(observer?: PartialObserver<A>): Subscription;
    run(next?: (next: A) => void, error?: (e: any) => void, complete?: () => void): Subscription;
    /**
     * Subscribes to an observable starting its' excecution.
     */
    unsafeRun(observer?: PartialObserver<A>): Subscription;
    unsafeRun(next?: (next: A) => void, error?: (e: any) => void, complete?: () => void): Subscription;
    /**
     * Subscribes to an observable starting its' excecution.
     */
    subscribe(observer?: PartialObserver<A>): Subscription;
    subscribe(next?: (next: A) => void, error?: (e: any) => void, complete?: () => void): Subscription;
    /**
     * Returns a new observable that runs both observable in order.
     * @param nextObservable
     */
    sequence<U,E0>(nextObservable: Observable<U,E0>): Observable<A | U, E | E0>;
    /**
     * Applies operators to the observable in argument order
     */
    pipe<B>(op0: Operator<A,B>): Observable<B>;
    pipe<B,C>(op0: Operator<A,B>,op1: Operator<B,C>): Observable<C>;
    pipe<B,C,D>(op0: Operator<A,B>,op1: Operator<B,C>,op2: Operator<C,D>): Observable<D>;
    pipe<B,C,D,E>(op0: Operator<A,B>,op1: Operator<B,C>,op2: Operator<C,D>,op3: Operator<D,E>): Observable<E>;
    pipe<B,C,D,E,F>(op0: Operator<A,B>,op1: Operator<B,C>,op2: Operator<C,D>,op3: Operator<D,E>,op4: Operator<E,F>): Observable<F>;
    pipe<B,C,D,E,F,G>(op0: Operator<A,B>,op1: Operator<B,C>,op2: Operator<C,D>,op3: Operator<D,E>,op4: Operator<E,F>,op5: Operator<F,G>): Observable<G>;
    pipe<B,C,D,E,F,G,H>(op0: Operator<A,B>,op1: Operator<B,C>,op2: Operator<C,D>,op3: Operator<D,E>,op4: Operator<E,F>,op5: Operator<F,G>,op6: Operator<G,H>): Observable<H>;
    pipe<B,C,D,E,F,G,H,I>(op0: Operator<A,B>,op1: Operator<B,C>,op2: Operator<C,D>,op3: Operator<D,E>,op4: Operator<E,F>,op5: Operator<F,G>,op6: Operator<G,H>,op7: Operator<H,I>): Observable<I>;
    pipe<B,C,D,E,F,G,H,I,J>(op0: Operator<A,B>,op1: Operator<B,C>,op2: Operator<C,D>,op3: Operator<D,E>,op4: Operator<E,F>,op5: Operator<F,G>,op6: Operator<G,H>,op7: Operator<H,I>,op8: Operator<I,J>): Observable<J>;
    /**
     * Applies operators to the observable in argument order. Seriously? More than 9? What are you doing man! Use method chainning!
     */
    pipe(...ops: Operator<any,any>[]): Observable<any, unknown>;
    /**
     * Returns a new observable that collects all the next calls in an array, calling next
     * with the array when the observable completes. *The source observable must complete*
     */
    collect(): Observable<A[],E>;
    /**
     * Returns a new observable with an auditor. The auditor defines when the observer gets notified
     * with the latest value of the audited observable. This function makes more sense if both 
     * observables are async.
     * @param auditor 
     */
    audit(auditor: Observable<A,never>): Observable<A,E>;
    /**
     * Returns a new observable with an auditor that is based on a timing to notify the observer
     * @param t time between audits/next calls
     */
    auditTime(t: number): Observable<A,E>;
    /**
     * Returns a new observable that runs an effect everytime it emits without altering the value. Used to run effects
     * @param eff function to call on next
     */
    tap(eff: (data: A) => void): Observable<A,E>;
    /**
     * Returns a new observable that runs an effect everytime it emits without altering the value. Used to run effects
     * @param eff function to call on next
     */
    peak(eff: (data: A) => void): Observable<A,E>;
    /**
     * Returns a new observable that completes after `n` next calls or until complete is called on it.
     */
    take(n: number): Observable<A,E>;
    /**
     * Returns a new observable that runs while a condition holds and completes when that condition is not met.
     * @param predicate 
     */
    takeWhile(predicate: (a: A) => boolean): Observable<A,E>
    /**
     * Returns a new observable that collects the last n calls to next in an array. *Requires the observable to complete* 
     * @param n number of calls to next
     */
    takeLast(n: number): Observable<A,E>;
    /**
     * Returns a new observable that returns the same values as the source observable until the other observable returns
     * @param stop 
     */
    takeUntil(stop: Observable<any>): Observable<A,E>
    /**
     * Returns a new observable that ignores the first n calls to next.
     * @param skips 
     */
    skip(skips: number): Observable<A,E>;
    /**
     * Maps all emitted values to a single value
     * @param fn 
     */
    mapTo<U>(data: U): Observable<U,E>
    /**
     * Maps an observable
     * @param fn 
     */
    map<U>(fn: (data: A) => U): Observable<U,E>
    /**
     * Returns a new observable that only emits values that pass the predicate
     * @param predicate 
     */
    filter(predicate: (data: A) => boolean): Observable<A,E>
    filter<T extends A>(predicate: (data: A) => data is T): Observable<T, E>
    /**
     * Returns a new observable that only emits values that pass the predicate
     * @param predicate 
     */
    refine<T extends A>(predicate: (data: A) => data is T): Observable<T, E>
    /**
     * Maps an observable
     * @param fn 
     */
    fmap<U>(fn: (data: A) => U): Observable<U,E>
    /**
     * Returns a new flat observable that returns all the emitted values of the emitted observables. 
     * Must be called on an observable of observables
     */
    mergeAll(): A extends Observable<infer U, infer E0> ? Observable<U,E|E0> : never
    /**
     * Returns a new flat observable that returns all the emitted values of the emitted observables. 
     * Must be called on an observable of observables
     */
    flat(): A extends Observable<infer U, infer E0> ? Observable<U,E|E0> : never
    /**
     * Returns a new flat observable that returns all the emitted values of the emitted observables. 
     * Must be called on an observable of observables
     */
    join(): A extends Observable<infer U, infer E0> ? Observable<U,E|E0> : never
    /**
     * Returns a new observable that flattens all the observables created with `fn`
     * using mergeAll
     * @param fn 
     */
    mergeMap<B,E0>(fn: (a: A) => Observable<B,E0>): Observable<B,E|E0>;
    /**
     * Returns a new observable that flattens all the observables created with `fn`
     * using mergeAll
     * @param fn 
     */
    flatMap<B,E0>(fn: (a: A) => Observable<B,E0>): Observable<B, E|E0>;
    /**
     * Returns a new observable that flattens all the observables created with `fn`
     * using mergeAll
     * @param fn 
     */
    chain<B,E0>(fn: (a: A) => Observable<B,E0>): Observable<B,E|E0>;
    /**
     * Returns a new observable that is the sequence of all emitted observables. 
     * No observables starts before the previous has completed 
     */
    concatAll(): A extends Observable<infer B, infer E0> ? Observable<B,E|E0> : never;
    /**
     * Returns a new observable that combines all emitted observables using concatAll
     * @param fn 
     */
    concatMap<B,E0>(fn: (a: A) => Observable<B,E0>): Observable<B,E|E0>;
    /**
     * Returns a new observable that is the sequence of all emitted observables. 
     * If an observable starts before the previous completes, then the previous is
     * unsubscribed. 
     */
    switchAll(): A extends Observable<infer B, infer E0> ? Observable<B,E|E0> : never
    /**
     * Returns a new observable that combines all emitted observables using switchAll
     * @param fn 
     */
    switchMap<B,E0>(fn: (a: A) => Observable<B,E0>): Observable<B,E|E0>;
    /**
     * Returns a new observables that combines all emitted observables by ignoring emitted
     * values from other observables while the current observable is executing. When that observable
     * completes then it will allow another observable to emit values and take the place of current
     * observable. If an observable starts while another is executing, then that observable is skipped.
     */
    exhaust(): A extends Observable<infer B, infer E0> ? Observable<B,E|E0> : never
    /**
     * Returns a new observable that combines all emitted observables using exhaust
     * @param fn 
     */
    exhaustMap<B,E0>(fn: (a: A) => Observable<B,E0>): Observable<B,E|E0>;
    /**
     * Returns a new observable than flattens all emitted observables by collecting all emitted 
     * values in an array. It waits for all observables to be created and then every time one
     * observable emits, it emits an array of all the latest values
     */
    combineAll(): A extends Observable<infer B, infer E0> ? Observable<B[],E|E0> : never
    /**
     * Returns a new observable that emits the latest values of both observables
     * @param other 
     */
    withLatestFrom<B,E0>(other: Observable<B,E0>): Observable<[A,B],E | E0>;
    /**
     * Returns a new observable with an async scheduler
     */
    async(): Observable<A,E>;
    /**
     * Returns a new observable with an asap scheduler
     */
    asap(): Observable<A,E>;
    /**
     * Returns a new observable with a sync scheduler
     */
    sync(): Observable<A,E>;
    /**
     * Returns a promise that resolves upon first next or complete event and rejects upon error event
     */
    toPromise(): Promise<A>;
    /**
     * Returns a thenable object that resolves upon first next or complete event and rejects upon error event
     */
    toThenable(): ThenableOf<A, E>;
    /**
      * Returns a new observable that will call the passed function on unsubscribe, after the original unsubscribe callback if any.
      * Receives the observer to trigger extra events on unsubscribe. It is still subject to normal observable contract constraints
     * @param fn 
     */
    cleanup(fn: (observer: Observer<A,E>) => void): Observable<A,E>;
    /**
     * Returns a new observable that will call the passed function on complete, after the original complete callback if any.
     * @param fn 
     */
    after(fn: () => void): Observable<A,E>;
    /**
     * Returns a new observable that will call the passed function on error, after the original error callback if any.
     * @param fn 
     */
    error(fn: (e: E) => void): Observable<A,E>;
    /**
     * Returns a new observable that on error, will use the passed function to run a new observable. The function receives the original 
     * observable for retrying
     * @param fn 
     */
    catchError(fn: (e: E, observable: Observable<A,E>) => void): Observable<A>;
}

import { Schedulers } from './schedulers'
import { Operators } from './operators'

export interface ObservableRep {
    /**
     * Create an observable from arguments with the default sync scheduler
     * @param args 
     */
    of<T>(...args: T[]): Observable<T,never>;
    /**
     * Create an observable from a subscribe function. The function will be called
     * when subscribe is called on the observable. If it returns a cleanup function,
     * it will be called on unsubscribe. The default scheduler is sync scheduler. 
     * @param fn 
     */
    from(fn: (observer: Observer<never,never>) => void, scheduler?: Scheduler): Observable<never>;
    from<T>(fn: (observer: Observer<T,never>) => void, scheduler?: Scheduler): Observable<T>;
    from<T,E>(fn: (observer: Observer<T,E>) => void, scheduler?: Scheduler): Observable<T>;
    /**
     * Create an observable from a subscribe function. The function will be called
     * when subscribe is called on the observable. If it returns a cleanup function,
     * it will be called on unsubscribe. The default scheduler is sync scheduler.
     * @param fn 
     */
    pure<T>(fn: (observer: Observer<T>) => void, scheduler?: Scheduler): Observable<T>;
    /**
     * Creates an observable from a promise. Triggers next when the promise resolves and
     * then calls complete. Triggers an error when the promise is rejected and then calls
     * complete
     * @param promise
     */
    fromPromise<T>(promise: Promise<T>): Observable<T>;
    /**
     * Creates an observable from the passed array. Will call next with each item of the array
     * @param xs 
     */
    fromArray<T>(xs: T[], scheduler?: Scheduler): Observable<T, never>;
    /**
     * Creates an observable from an event. Receives the event target and event name. 
     * @param target 
     * @param event 
     */
    fromEvent<T>(target: PartialEventTarget<T>, event: string): Observable<T>;
    /**
     * Creates an observable that emits values on an interval with an increasing count
     * starting from 0. The time between triggers is the passed argument. Optionally,
     * recieves a mapping function to map the values.
     * @param time 
     */
    interval(time: number): Observable<number>;
    interval<T>(time: number, mapFn?: (i: number) => T): Observable<T>;
    /**
     * Returns an observable that immediately throws
     * @param err 
     */
    throwError(err: any): Observable<never>;
    /**
     * Returns an observable that immediately completes
     */
    complete(): Observable<never>;
    operators: Operators,
    schedulers: Schedulers,
}