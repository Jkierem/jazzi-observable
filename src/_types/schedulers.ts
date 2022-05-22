import type { Scheduler } from '.'

export interface Schedulers {
    asyncScheduler: Scheduler;
    syncScheduler: Scheduler;
    asapScheduler: Scheduler;
}
