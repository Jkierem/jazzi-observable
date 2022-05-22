import type { Scheduler } from "./mod.ts"

export interface Schedulers {
    asyncScheduler: Scheduler;
    syncScheduler: Scheduler;
    asapScheduler: Scheduler;
}
