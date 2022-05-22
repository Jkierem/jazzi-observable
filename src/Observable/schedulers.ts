import type { Scheduler } from "../_types"
const mkScheduler = (runTask): Scheduler => ({ runTask })

export const asyncScheduler = mkScheduler((fn) => setTimeout(fn,0))
export const syncScheduler = mkScheduler((fn) => fn())
export const asapScheduler = mkScheduler((fn) => Promise.resolve().then(fn))