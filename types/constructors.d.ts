import Observable from './'

/**
 * Create an observable from arguments with the default sync scheduler
 * @param args 
 */
export declare const of: typeof Observable.of;
/**
 * Create an observable from a subscribe function. The function will be called
 * when subscribe is called on the observable. If it returns a cleanup function,
 * it will be called on unsubscribe. The default scheduler is sync scheduler.
 * @param fn 
 */
export declare const from: typeof Observable.from;
/**
 * Creates an observable from the passed array. Will call next with each item of the array
 * @param xs 
 */
export declare const fromArray: typeof Observable.fromArray;
/**
 * Creates an observable from an event. Receives the event target and event name. 
 * @param target 
 * @param event 
 */
export declare const fromEvent: typeof Observable.fromEvent;
/**
 * Creates an observable from a promise. Triggers next when the promise resolves and
 * then calls complete. Triggers an error when the promise is rejected and then calls
 * complete
 * @param promise
 */
export declare const fromPromise: typeof Observable.fromPromise;
/**
 * Creates an observable that emits values on an interval with an increasing count
 * starting from 0. The time between triggers is the passed argument. Optionally,
 * recieves a mapping function to map the values.
 * @param time 
 */
export declare const interval: typeof Observable.interval;
/**
 * Create an observable from a subscribe function. The function will be called
 * when subscribe is called on the observable. If it returns a cleanup function,
 * it will be called on unsubscribe. The default scheduler is sync scheduler.
 * @param fn 
 */
export declare const pure: typeof Observable.pure;