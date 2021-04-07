import equals from 'ramda/src/equals'

/* istanbul ignore next : spy works believe me*/
export const Spy = (fn = x => x) => {
    let callCount = 0;
    let calls = []
    let _spy = (...args) => {
        callCount++;
        const res = fn(...args)
        calls.push({
            args, 
            result: res, 
            callTime: Date.now(),
            calledBefore(otherCall){
                return this.callTime - otherCall.callTime < 0
            },
            calledAfter(otherCall){
                return this.callTime - otherCall.callTime >= 0
            }
        });
        return res;
    }

    Object.defineProperty(_spy,"called",{
        get: () => callCount > 0
    })

    Object.defineProperty(_spy,"callCount",{
        get: () => callCount
    })
    Object.defineProperty(_spy,"calls",{
        get: () => calls
    })

    _spy.calledWith = (...args) => calls.map(prop("args")).some(equals(args));

    _spy.reset = () => {
        callCount = 0 
        calls = []
    }

    _spy.debug = () => {
        return {
            callCount: _spy.callCount,
            calls: _spy.calls,
            called: _spy.called,
        }
    }

    return _spy
}