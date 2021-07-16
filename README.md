# Jazzi Observable

Observable implementation using jazzi

## Installation

```sh
npm install jazzi-observable
//or
yarn add jazzi-observable
```

## Basic Usage

```javascript
import Observable from "jazzi-observable"

// Create the observable
const obs = Observable.of(1,2,3)

// Subscribe to the observable
const subscription = obs.subscribe({
    next: x => console.log(x)
})

// Unsubscribe
subscription.unsubscribe()
```

## API

### Observable Type

This is the default export of the library. It is a huge object with all the constructors, operators and schedulers. 

```javascript 
import Observable from 'jazzi-observable'
const { map, filter } = Observable.operators;
const { asyncScheduler } = Observable.schedulers;

const obs = Observable
.fromArray([1,2,3], asyncScheduler)
.pipe(
    map(x => x + 1),
    filter(x => x % 2 === 0)
)

obs.subscribe(console.log) 
// Asyncrously logs
// 2
// 4
// and then completes
```

### Subscription Object

When calling subscribe on an observable, a subscription object is returned. It is actually a function with an unsubcribe attribute. Either calling the function or calling the unsubscribe attribute will unsubscribe from the observable

```javascript
import { of } from "jazzi-observable/constructors";

const asyncLogger = of(1,2,3)
    .async()
    .tap(console.log);

// Starts the observable
const sub = asyncLogger.subscribe()

// Both have the same effect
sub()
sub.unsubscribe()
```

### Constructors

These are the functions that return an observable. There are 10:

```javascript
import Observable from 'jazzi-observable';

Observable.Observable(fn)                // Receives a function to call on subscribe. The function receives an observer
Observable.of(...args)                   // Returns an observable that emits the received arguments
Observable.from(fn)                      // Alias of Observable
Observable.pure(someFunction)            // Alias of Observable
Observable.fromPromise(promise)          // Returns an observable from a promise
Observable.fromArray(array)              // Returns an observable that emits the values from an array
Observable.fromEvent(target,eventName)   // Returns an observable that emits when the event triggers
Observable.interval(milliseconds)        // Returns an observable that emits an increasing sequence of integers in an interval
Observable.throwError(anything)          // Returns an observable that immediately throws whatever you pass it
Observable.complete()                    // Returns an observable that immediately completes
```

All constructors can be imported as standalone functions (with the exception of `Observable.Observable`) from `jazzi-observable/constructors`

### Operators

There are two ways to use operators. Either as observable methods on an observable instance or as functions that can be passed to the pipe method. Actually, any function that receives and returns an observable can be passed to the pipe method.

```javascript
import { of } from 'jazzi-observable/constructors';
import { map, mergeAll } from 'jazzi-observable/operators';

of(1,2,3)
.map(x => of(x,x+1,x+2))
.mergeAll()

// or in pipe style

of(1,2,3)
.pipe(
    map(x => of(x,x+1,x+2)),
    mergeAll()
)
```

All operators are functions that return a function that can be passed to the pipe method so even if they receive no arguments, it must be called. This was decided to maintain consistency. The list of available operators are the following:

- `sequence`, `collect`, `audit`, `auditTime`, `tap`, `take`, `takeWhile`, `takeLast`, `takeUntil`, `skip`, `mergeAll`, `mergeMap`, `concatAll`, `concatMap`, `switchAll`, `switchMap`, `exhaust`, `exhaustMap`, `combineAll`, `withLatestFrom`, `async`, `asap`, `sync`, `mapTo`, `map`, `fmap`, `filter`, `bind`, `chain`, `flatMap`, `effect`, `peak`, `flat`, `join`

for more info check API.md

## Additional Notes

- The Observable type was built using jazzi typeclasses. It implements Functor, Filterable, Effect, Monad and Thenable. For more info on that check out jazzi.

- As Thenable objects, observables can be await'ed. On await, they are subscribed. Optionally you can call toPromise to create a promise from the observable.

```javascript
import { of, complete, throwError } from 'jazzi-observable/constructors';

async function someAsyncStuff(){
    const firstEmition = await of(1,2,3)
    console.log(firstEmition) // Logs 1 ignores 2 and 3

    const undefinedIfComplete = await complete()
    console.log(undefinedIfComplete) // Logs undefined

    const sameEffectAsJustAwait =  await of(1,2,3).toPromise()
    console.log(sameEffectAsJustAwait) // Logs 1 ignores 2 and 3
}

async function someMoreAsynStuff(){
    try {
        const thisThrows = await throwError(42)
    } catch (e) {
        console.log(`this is ${e}`) // Logs "this is 42"
    }
}
```