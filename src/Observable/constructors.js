import Observable from "./";
import { makeFactory } from "../_internals";
const createConstructor = makeFactory(Observable)

export const of = createConstructor("of")
export const from = createConstructor("from")
export const fromArray = createConstructor("fromArray")
export const fromEvent = createConstructor("fromEvent")
export const fromPromise = createConstructor("fromPromise")
export const interval = createConstructor("interval")
export const pure = createConstructor("pure")
export const throwError = createConstructor("throwError")
export const complete = createConstructor("complete")