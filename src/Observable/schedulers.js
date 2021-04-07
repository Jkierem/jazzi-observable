const Scheduler = (runTask) => ({ runTask })

export const asyncScheduler = Scheduler((fn) => setTimeout(fn,0))
export const syncScheduler = Scheduler((fn) => fn())
export const asapScheduler = Scheduler((fn) => Promise.resolve().then(fn))