export {};

declare global {
  namespace jest {
    interface Matchers<R> {
      toTypeMatch(name: string): R;
      toHaveCallCountOf(count: number): R;
      toHaveBeenCalledWith(...args: any[]): R;
      jazziToHaveBeenCalled(): R;
      toHaveBeenCalledOnce(): R;
      toHaveBeenCalledTwice(): R;
      toHaveBeenCalledThrice(): R;
      toHaveValueOf(val: any): R;
      calledBefore(val: any): R;
      calledAfter(val: any): R;
    }
  }
} 