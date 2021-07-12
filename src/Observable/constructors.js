import Observable from "./";

export const of = (...args) => Observable.of(...args);
export const from = (...args) => Observable.from(...args);
export const fromArray = (...args) => Observable.fromArray(...args);
export const fromEvent = (...args) => Observable.fromEvent(...args);
export const fromPromise = (...args) => Observable.fromPromise(...args);
export const interval = (...args) => Observable.interval(...args);