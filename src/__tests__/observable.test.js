import Observable from "../Observable";
import { Spy } from "../_internals/spy";

const createMockObservable = (creator) => {
  const nextSpy = Spy()
  const completeSpy = Spy()
  const errorSpy = Spy()
  const observable = creator()

  return {
    observable,
    run: () => observable.subscribe({
      next: nextSpy,
      complete: completeSpy,
      error: errorSpy,
    }), 
    spies: {
      nextSpy,
      completeSpy,
      errorSpy
    }
  }
}

describe("Observable", () => {
  describe("Observable contract", () => {
    it("should not call next or error if complete is called before", () => {
      const {
        run,
        spies: { nextSpy, errorSpy }
      } = createMockObservable(() => Observable.from(sub => {
        sub.complete();
        sub.next();
        sub.error();
      }))

      run();

      expect(nextSpy.called).toBeFalsy();
      expect(errorSpy.called).toBeFalsy();
    })
    it("should not call next or complete if error is called before", () => {
      const {
        run,
        spies: { nextSpy, completeSpy }
      } = createMockObservable(() => Observable.from(sub => {
        sub.error();
        sub.next();
        sub.complete();
      }))

      run();

      expect(nextSpy.called).toBeFalsy();
      expect(completeSpy.called).toBeFalsy();
    })

    it("should not call next if unsubscribe is called before",() => {
      const { run, spies: { nextSpy } } = createMockObservable(() => Observable.from(sub => Promise.resolve().then(sub.next)))
      const unsub = run()
      unsub()
      expect(nextSpy.called).toBeFalsy()
    })
    it("should not call error if unsubscribe is called before",() => {
      const { run, spies: { errorSpy } } = createMockObservable(() => Observable.from(sub => Promise.resolve().then(sub.error)))
      const unsub = run()
      unsub()
      expect(errorSpy.called).toBeFalsy()
    })
    it("should not call complete if unsubscribe is called before",() => {
      const { run, spies: { completeSpy } } = createMockObservable(() => Observable.from(sub => Promise.resolve().then(sub.complete)))
      const unsub = run()
      unsub()
      expect(completeSpy.called).toBeFalsy()
    })
  })
  describe("constructors", () => {
    it("should construct from function", () => {
      const {
        run,
        spies: {
          nextSpy, errorSpy, completeSpy
        }
      } = createMockObservable(() => Observable.from((sub) => {
        [1,2,3].forEach(x => sub.next(x));
        sub.complete()
        sub.error()
      }))

      run();

      expect(nextSpy.callCount).toBe(3);
      expect(nextSpy.calledWith(1)).toBeTruthy();
      expect(nextSpy.calledWith(2)).toBeTruthy();
      expect(nextSpy.calledWith(3)).toBeTruthy();

      expect(completeSpy.callCount).toBe(1);
      expect(errorSpy.called).toBeFalsy();
    })
    it("should construct from array", () => {
      const {
        run,
        spies: {
          nextSpy, errorSpy, completeSpy
        }
      } = createMockObservable(() => Observable.fromArray([1,2,3]))

      run();

      expect(nextSpy.callCount).toBe(3);
      expect(nextSpy.calledWith(1)).toBeTruthy();
      expect(nextSpy.calledWith(2)).toBeTruthy();
      expect(nextSpy.calledWith(3)).toBeTruthy();

      expect(completeSpy.callCount).toBe(1);
      expect(errorSpy.called).toBeFalsy();
    })
  })

  describe("methods", () => {
    describe("Observable", () => {
      it("unsubscribe -> should call cleanup function", () => {
        const unsubSpy = Spy()
        const { run } = createMockObservable(() => Observable.from(() => unsubSpy))
  
        expect(unsubSpy.called).toBeFalsy()
        const unsub = run();
        unsub()
        expect(unsubSpy.called).toBeTruthy()
      })

      it("unsubscribe -> should stop next from being called", () => {
        const { 
          run , spies: { nextSpy } 
        } = createMockObservable(() => Observable.from((sub) => {
          Promise.resolve().then(() => sub.next(42))
        }))

        run()()

        expect(nextSpy.called).toBeFalsy()
      })

      it("collect -> should return a new observable that collects all the next calls in an array", () => {
        const observable =  Observable.fromArray([1,2,3])

        const outerNextSpy = Spy()
        observable.collect().subscribe({ next: outerNextSpy })

        expect(outerNextSpy.callCount).toBe(1)
        expect(outerNextSpy.calledWith([1,2,3])).toBeTruthy()
      })

      it("sequence -> should return a new observable with the output of the two observables in sequence", () => {
        const first = Observable.fromArray([1,2,3])
        const second = Observable.fromArray([4,5,6])
        const sequenced = first.sequence(second);

        const nextData = []
        const nextSpy = Spy((x) => nextData.push(x));

        sequenced.subscribe({ next: nextSpy })

        expect(nextSpy.callCount).toBe(6)
        expect(nextData).toStrictEqual([1,2,3,4,5,6])
      })

      it("sequence -> unsubscribe should unsub from both sequenced observables", (done) => {
        const first = Observable.fromArray([1,2,3])
        const second = Observable.from(sub => Promise.resolve().then(() => {
          [4,5,6].forEach(x => sub.next(x));
          expect(nextSpy.callCount).toBe(3)
          expect(nextData).toStrictEqual([1,2,3])
          done()
        }))
        const sequenced = first.sequence(second);

        const nextData = []
        const nextSpy = Spy((x) => nextData.push(x));

        const unsub = sequenced.subscribe({ next: nextSpy })
        unsub()
      })
    })

    describe("Functor Observable", () => {
      it("map -> should map the next values", () => {
        const times2 = Spy(x => x * 2)
        const {
          run,
          spies: { nextSpy }
        } = createMockObservable(() => Observable.fromArray([1,2,3]).fmap(times2))
        
        expect(nextSpy.called).toBeFalsy();
        expect(times2.called).toBeFalsy();
  
        run()
  
        expect(nextSpy.callCount).toBe(3);
        expect(nextSpy.calledWith(2)).toBeTruthy();
        expect(nextSpy.calledWith(4)).toBeTruthy();
        expect(nextSpy.calledWith(6)).toBeTruthy();
        
        expect(times2.callCount).toBe(3);
        expect(times2.calledWith(1)).toBeTruthy();
        expect(times2.calledWith(2)).toBeTruthy();
        expect(times2.calledWith(3)).toBeTruthy();
      })
    })

    describe("Filterable Observable", () => {
      it("filter -> should filter values based on predicate", () => {
        const {
          run, spies: { nextSpy }
        } = createMockObservable(() => Observable.fromArray([1,2,3,4]).filter(x => x % 2 == 0))

        run()

        expect(nextSpy.callCount).toBe(2);
        expect(nextSpy.calledWith(2)).toBeTruthy();
        expect(nextSpy.calledWith(4)).toBeTruthy();        
      })
    })
  })
})