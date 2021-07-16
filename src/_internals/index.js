const prop = (key) => (obj) => obj?.[key];
export const Internal = Symbol("@@internal");
export const getInternal = prop(Internal)

export const createOperator = what => (...args) => (observable) => observable[what](...args)
export const makeFactory = observable => ctor => (...args) => observable[ctor](...args)

export const once = fn => {
    let called = false;
    return (...args) => {
        if(!called){
            called = true;
            fn(...args)
        }
    }
}

export const compose = (a,b) => (...args) => a(b(...args))
export const sequence = (a,b) => (...args) => b(a(...args))