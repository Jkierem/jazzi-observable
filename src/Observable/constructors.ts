import Observable from "./";
import { makeFactory } from "../_internals";
import type { ObservableRep } from '../_types/index'
const createConstructor = makeFactory(Observable)

export const of = createConstructor("of") as ObservableRep["of"]
export const from = createConstructor("from") as ObservableRep["from"]
export const fromArray = createConstructor("fromArray") as ObservableRep["fromArray"]
export const fromEvent = createConstructor("fromEvent") as ObservableRep["fromEvent"]
export const fromPromise = createConstructor("fromPromise") as ObservableRep["fromPromise"]
export const interval = createConstructor("interval") as ObservableRep["interval"]
export const pure = createConstructor("pure") as ObservableRep["pure"]
export const throwError = createConstructor("throwError") as ObservableRep["throwError"]
export const complete = createConstructor("complete") as ObservableRep["complete"]