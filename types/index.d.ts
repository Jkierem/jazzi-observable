export declare type Scheduler = {
    runTask: (fn: () => void) => void;
}

export declare type Subscription = (() => void) & {
    unsubscribe: () => void;
}

export declare type Operator<T,U> = (inputObservable: Observable<T>) => Observable<U>;

export declare type Observer<T> = {
    next: (n: T) => void;
    complete?: () => void;
    error?: (e: Error) => void;
}

declare type PartialEventTarget<T> = {
    addEventListener: (event: string, handler: (e: T) => void) => void;
    removeEventListener: (event: string, handler: (e: T) => void) => void;
}

declare interface  Observable<A> {
    /**
     * Subscribes to an observable starting its' excecution.
     */
    run(observer?: Observer<A>): Subscription;
    run(next?: (next: A) => void, error?: (e: any) => void, complete?: () => void): Subscription;
    /**
     * Subscribes to an observable starting its' excecution.
     */
    unsafeRun(observer?: Observer<A>): Subscription;
    unsafeRun(next?: (next: A) => void, error?: (e: any) => void, complete?: () => void): Subscription;
    /**
     * Subscribes to an observable starting its' excecution.
     */
    subscribe(observer?: Observer<A>): Subscription;
    subscribe(next?: (next: A) => void, error?: (e: any) => void, complete?: () => void): Subscription;
    /**
     * Returns a new observable that runs both observable in order.
     * @param nextObservable
     */
    sequence<U>(nextObservable: Observable<U>): Observable<A | U>;
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
    pipe(...ops: Operator<any,any>[]): Observable<any>;
    /**
     * Returns a new observable that collects all the next calls in an array, calling next
     * with the array when the observable completes. *The source observable must complete*
     */
    collect(): Observable<A[]>;
    /**
     * Returns a new observable with an auditor. The auditor defines when the observer gets notified
     * with the latest value of the audited observable. This function makes more sense if both 
     * observables are async.
     * @param auditor 
     */
    audit(auditor: Observable<A>): Observable<A>;
    /**
     * Returns a new observable with an auditor that is based on a timing to notify the observer
     * @param t time between audits/next calls
     */
    auditTime(t: number): Observable<A>;
    /**
     * Returns a new observable that runs an effect everytime it emits without altering the value. Used to run effects
     * @param eff function to call on next
     */
    tap(eff: (data: A) => void): Observable<A>;
    /**
     * Returns a new observable that runs an effect everytime it emits without altering the value. Used to run effects
     * @param eff function to call on next
     */
    effect(eff: (data: A) => void): Observable<A>;
    /**
     * Returns a new observable that runs an effect everytime it emits without altering the value. Used to run effects
     * @param eff function to call on next
     */
    peak(eff: (data: A) => void): Observable<A>;
    /**
     * Returns a new observable that completes after `n` next calls or until complete is called on it.
     */
    take(n: number): Observable<A>;
    /**
     * Returns a new observable that runs while a condition holds and completes when that condition is not met.
     * @param predicate 
     */
    takeWhile(predicate: (a: A) => boolean): Observable<A>
    /**
     * Returns a new observable that collects the last n calls to next in an array. *Requires the observable to complete* 
     * @param n number of calls to next
     */
    takeLast(n: number): Observable<A>;
    /**
     * Returns a new observable that returns the same values as the source observable until the other observable returns
     * @param stop 
     */
    takeUntil(stop: Observable<any>): Observable<A>
    /**
     * Returns a new observable that ignores the first n calls to next.
     * @param skips 
     */
    skip(skips: number): Observable<A>;
    /**
     * Maps all emitted values to a single value
     * @param fn 
     */
    mapTo<U>(data: U): Observable<U>
    /**
     * Maps an observable
     * @param fn 
     */
    map<U>(fn: (data: A) => U): Observable<U>
    /**
     * Returns a new observable that only emits values that pass the predicate
     * @param predicate 
     */
    filter(predicate: (data: A) => boolean): Observable<A>
    /**
     * Maps an observable
     * @param fn 
     */
    fmap<U>(fn: (data: A) => U): Observable<U>
    /**
     * Returns a new flat observable that returns all the emitted values of the emitted observables. 
     * Must be called on an observable of observables
     */
    mergeAll(): A extends Observable<infer U> ? Observable<U> : never
    /**
     * Returns a new flat observable that returns all the emitted values of the emitted observables. 
     * Must be called on an observable of observables
     */
    flat(): A extends Observable<infer U> ? Observable<U> : never
    /**
     * Returns a new flat observable that returns all the emitted values of the emitted observables. 
     * Must be called on an observable of observables
     */
    join(): A extends Observable<infer U> ? Observable<U> : never
    /**
     * Returns a new observable that flattens all the observables created with `fn`
     * using mergeAll
     * @param fn 
     */
    mergeMap<B>(fn: (a: A) => Observable<B>): Observable<B>;
    /**
     * Returns a new observable that flattens all the observables created with `fn`
     * using mergeAll
     * @param fn 
     */
    flatMap<B>(fn: (a: A) => Observable<B>): Observable<B>;
    /**
     * Returns a new observable that flattens all the observables created with `fn`
     * using mergeAll
     * @param fn 
     */
    bind<B>(fn: (a: A) => Observable<B>): Observable<B>;
    /**
     * Returns a new observable that flattens all the observables created with `fn`
     * using mergeAll
     * @param fn 
     */
    chain<B>(fn: (a: A) => Observable<B>): Observable<B>;
    /**
     * Returns a new observable that is the sequence of all emitted observables. 
     * No observables starts before the previous has completed 
     */
    concatAll(): A extends Observable<infer B> ? Observable<B> : never;
    /**
     * Returns a new observable that combines all emitted observables using concatAll
     * @param fn 
     */
    concatMap<B>(fn: (a: A) => Observable<B>): Observable<B>;
    /**
     * Returns a new observable that is the sequence of all emitted observables. 
     * If an observable starts before the previous completes, then the previous is
     * unsubscribed. 
     */
    switchAll(): A extends Observable<infer B> ? Observable<B> : never
    /**
     * Returns a new observable that combines all emitted observables using switchAll
     * @param fn 
     */
    switchMap<B>(fn: (a: A) => Observable<B>): Observable<B>;
    /**
     * Returns a new observables that combines all emitted observables by ignoring emitted
     * values from other observables while the current observable is executing. When that observable
     * completes then it will allow another observable to emit values and take the place of current
     * observable. If an observable starts while another is executing, then that observable is skipped.
     */
    exhaust(): A extends Observable<infer B> ? Observable<B> : never
    /**
     * Returns a new observable that combines all emitted observables using exhaust
     * @param fn 
     */
    exhaustMap<B>(fn: (a: A) => Observable<B>): Observable<B>;
    /**
     * Returns a new observable than flattens all emitted observables by collecting all emitted 
     * values in an array. It waits for all observables to be created and then every time one
     * observable emits, it emits an array of all the latest values
     */
    combineAll(): A extends Observable<infer B> ? Observable<B[]> : never
    /**
     * Returns a new observable that emits the latest values of both observables
     * @param other 
     */
    withLatestFrom<B>(other: Observable<B>): Observable<[A,B]>;
    /**
     * Returns a new observable with an async scheduler
     */
    async(): Observable<A>;
    /**
     * Returns a new observable with an asap scheduler
     */
    asap(): Observable<A>;
    /**
     * Returns a new observable with a sync scheduler
     */
    sync(): Observable<A>;
    /**
     * Returns a promise that resolves upon first next or complete event and rejects upon error event
     */
    toPromise(): Promise<A>;
    /**
     * Thenable interface of Observable. Limits the observable to 1 emition and then subscribes to the 
     * observable using onResolve as next and complete handler (calling only one) and onReject as error handler
     * @param onResolve 
     * @param onReject 
     */
    then(onResolve: (a: A) => void, onReject: (err: any) => void): void;
    /**
     * Limits the observable to 1 emition and then subscribes to the observable using onReject as error handler
     * @param onReject 
     */
    catch(onReject: (err: any) => void): void;
    /**
      * Returns a new observable that will call the passed function on unsubscribe, after the original unsubscribe callback if any.
      * Receives the observer to trigger extra events on unsubscribe. It is still subject to normal observable contract constraints
     * @param fn 
     */
    cleanup(fn: (observer: Observer<A>) => void): Observable<A>;
    /**
     * Returns a new observable that will call the passed function on complete, after the original complete callback if any.
     * @param fn 
     */
    after(fn: () => void): Observable<A>;
    /**
     * Returns a new observable that will call the passed function on error, after the original error callback if any.
     * @param fn 
     */
    error(fn: (e: any) => void): Observable<A>;
    /**
     * Returns a new observable that on error, will used to passed function run a new observable. The function receives the original 
     * observable for retrying
     * @param fn 
     */
    catchError(fn: (e: any, observable: Observable<A>) => void): Observable<A>;
}

import * as schedulers from './schedulers'
import * as operators from './operators'

declare const Observable: {
    /**
     * Create an observable from arguments with the default sync scheduler
     * @param args 
     */
    of<T>(...args: T[]): Observable<T>;
    /**
     * Create an observable from a subscribe function. The function will be called
     * when subscribe is called on the observable. If it returns a cleanup function,
     * it will be called on unsubscribe. The default scheduler is sync scheduler. 
     * @param fn 
     */
    from<T>(fn: (observer: Observer<T>) => void, scheduler?: Scheduler): Observable<T>;
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
    fromArray<T>(xs: T[], scheduler?: Scheduler): Observable<T>;
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
    operators: typeof operators,
    schedulers: typeof schedulers,
}

export default Observable;
export {};