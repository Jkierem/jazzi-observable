const prop = (key) => (obj) => obj?.[key];
export const Internal = Symbol("@@internal");
export const getInternal = prop(Internal)

export const createOperator = what => (...args) => (observable) => observable[what](...args)