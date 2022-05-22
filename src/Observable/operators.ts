import { createOperator } from '../_internals'
import type { Observable, Operator, Observer } from '../_types'

export const sequence = createOperator("sequence") as <A,B>(nextObs: Observable<A>) => Operator<B,A|B>;
export const collect = createOperator("collect") as <A>() => Operator<A, A[]>;
export const audit = createOperator("audit") as <A>(auditor: Observable<any>) => Operator<A,A>;
export const auditTime = createOperator("auditTime") as <A>(n: number) => Operator<A,A>;
export const tap = createOperator("tap") as <A>(fn: (a: A) => void) => Operator<A,A>;
export const take = createOperator("take") as <A>(n: number) => Operator<A,A>;
export const takeWhile = createOperator("takeWhile") as <A>(predicate: (a: A) => boolean) => Operator<A,A>;
export const takeLast = createOperator("takeLast") as <A>(n: number) => Operator<A,A>;
export const takeUntil = createOperator("takeUntil") as <A>(stop: Observable<any>) => Operator<A,A>;
export const skip = createOperator("skip") as <A>(skips: number) => Operator<A,A>;
export const mergeAll = createOperator("mergeAll") as <A>() => Operator<Observable<A>,A>;
export const mergeMap = createOperator("mergeMap") as <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
export const concatAll = createOperator("concatAll") as <A>() => Operator<Observable<A>,A>;
export const concatMap = createOperator("concatMap") as <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
export const switchAll = createOperator("switchAll") as <A>() => Operator<Observable<A>,A>;
export const switchMap = createOperator("switchMap") as <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
export const exhaust = createOperator("exhaust") as <A>() => Operator<Observable<A>,A>;
export const exhaustMap = createOperator("exhaustMap") as <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
export const combineAll = createOperator("combineAll") as <A>() => Operator<Observable<A>,A[]>;
export const withLatestFrom = createOperator("withLatestFrom") as <A,B>(other: Observable<B>) => Operator<A,[A,B]>;
export const async = createOperator("async") as <A>() => Operator<A,A>;
export const asap = createOperator("asap") as <A>() => Operator<A,A>;
export const sync = createOperator("sync") as <A>() => Operator<A,A>;
export const mapTo = createOperator("mapTo") as <A,B>(data: B) => Operator<A,B>;
export const map = createOperator("map") as <A,B>(fn: (a: A) => B) => Operator<A,B>;
export const fmap = createOperator("fmap") as <A,B>(fn: (a: A) => B) => Operator<A,B>;
export const filter = createOperator("filter") as <A>(predicate: (data: A) => boolean) => Operator<A,A>;
export const chain = createOperator("chain") as <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
export const flatMap = createOperator("flatMap") as <A,B>(fn: (a: A) => Observable<B>) => Operator<A,B>;
export const peak = createOperator("peak") as <A>(fn: (a: A) => void) => Operator<A,A>;
export const flat = createOperator("flat") as <A>() => Operator<Observable<A>,A>;
export const join = createOperator("join") as <A>() => Operator<Observable<A>,A>;
export const cleanup = createOperator("cleanup") as <A>(fn: (observer: Observer<A>) => void) => Operator<A,A>;
export const after = createOperator("after") as <A>(fn: () => void) => Operator<A,A>;
export const error = createOperator("error") as <A>(fn: (e: any) => void) => Operator<A,A>;
export const catchError = createOperator("catchError") as <A>(fn: (e: any, observable: Observable<A>) => void) => Operator<A,A>;