import type { Scheduler } from "../_types/mod.ts";


type CreateTask = (fn: () => void) => void

const mkScheduler = (runTask: CreateTask): Scheduler => ({ runTask })

export const asyncScheduler = mkScheduler((fn) => setTimeout(fn,0))
export const syncScheduler = mkScheduler((fn) => fn())
export const asapScheduler = mkScheduler((fn) => Promise.resolve().then(fn))