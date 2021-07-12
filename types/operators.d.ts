import type Observable from './'
import type { Operator } from './'

export declare const sequence: <A,B>(nextObs: Observable<A>) => Operator<B,A|B>;
export declare const collect: <A>() => Operator<A, A[]>;
export declare const audit: <A>(auditor: Observable<any>) => Operator<A,A>;
export declare const auditTime: <A>(n: number) => Operator<A,A>;
export declare const tap: <A>(fn: (a: A) => void) => Operator<A,A>;
export declare const take: <A>(n: number) => Operator<A,A>;
export declare const takeWhile: <A>(predicate: (a: A) => boolean) => Operator<A,A>;
export declare const takeLast: <A>(n: number) => Operator<A,A>;
export declare const takeUntil: <A>(stop: Observable<any>) => Operator<A,A>;
export declare const skip: <A>(skips: number) => Operator<A,A>;
export declare const mergeAll: <A>() => Operator<Observable<A>,A>;
export declare const mergeMap: <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
export declare const concatAll: <A>() => Operator<Observable<A>,A>;
export declare const concatMap: <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
export declare const switchAll: <A>() => Operator<Observable<A>,A>;
export declare const switchMap: <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
export declare const exhaust: <A>() => Operator<Observable<A>,A>;
export declare const exhaustMap: <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
export declare const combineAll: <A>() => Operator<Observable<A>,A[]>;
export declare const withLatestFrom: <A,B>(other: Observable<B>) => Operator<A,[A,B]>;
export declare const async: <A>() => Operator<A,A>;
export declare const asap: <A>() => Operator<A,A>;
export declare const sync: <A>() => Operator<A,A>;
export declare const mapTo: <A,B>(data: B) => Operator<A,B>;
export declare const map: <A,B>(fn: (a: A) => B) => Operator<A,B>;
export declare const fmap: <A,B>(fn: (a: A) => B) => Operator<A,B>;
export declare const filter: <A>(predicate: (data: A) => boolean) => Operator<A,A>;
export declare const bind: <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
export declare const chain: <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
export declare const flatMap: <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
export declare const effect: <A>(fn: (a: A) => void) => Operator<A,A>;