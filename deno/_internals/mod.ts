const prop = <T, K extends keyof T>(key: K) => (obj: T) => obj?.[key];
export const Internal = Symbol("@@internal");
export const getInternal = prop<{ [Internal]: any },typeof Internal>(Internal)

export const createOperator = (what: string) => (...args: any[]) => (observable: any) => observable[what](...args)
export const makeFactory = (observable: any) => (ctor: string) => (...args: any[]) => observable[ctor](...args)

export const once = <Fn extends (...args: any[]) => void>(fn: Fn) => {
    let called = false;
    return (...args: Parameters<Fn>) => {
        if(!called){
            called = true;
            fn(...args)
        }
    }
}

export const sequence = (a: any, b: any) => (...args: any[]) => b(a(...args))