import { useEffect, useMemo, useRef } from 'react';

export interface CallOptions {
  leading?: boolean;
  trailing?: boolean;
}

export interface Options extends CallOptions {
  debounceOnServer?: boolean;
  maxWait?: number;
}

export interface ControlFunctions<ReturnT> {
  cancel: () => void;
  flush: () => ReturnT | undefined;
  isPending: () => boolean;
}

export interface DebouncedState<T extends (...args: any[]) => ReturnType<T>>
  extends ControlFunctions<ReturnType<T>> {
  (...args: Parameters<T>): ReturnType<T> | undefined;
}

export function useDebouncedCallback<T extends (...args: any[]) => ReturnType<T>>(
  func: T,
  waitMs = 0,
  inputOptions: Options = {}
): DebouncedState<T> {
  const lastCallTime = useRef<number | null>(null);
  const lastInvokeTime = useRef(0);
  const timerId = useRef<number | null>(null);
  const lastArgs = useRef<any[] | null>([]);
  const lastThis = useRef<any>();
  const result = useRef<ReturnType<T>>();
  const funcRef = useRef(func);
  const mounted = useRef(true);

  funcRef.current = func;

  const isClientSize = typeof window !== 'undefined';
  const useRAF = !waitMs && waitMs !== 0 && isClientSize;

  if (typeof func !== 'function') {
    throw new TypeError('Expected a function');
  }

  const leading = !!inputOptions.leading;
  const trailing = 'trailing' in inputOptions ? !!inputOptions.trailing : true;
  const maxing = 'maxWait' in inputOptions;
  const debounceOnServer = !!inputOptions.debounceOnServer;
  const maxWait = maxing ? Math.max(inputOptions.maxWait || 0, waitMs) : null;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const debounced = useMemo(() => {
    const invokeFunc = (time: number) => {
      const args = lastArgs.current;
      const thisArg = lastThis.current;

      lastArgs.current = lastThis.current = null;
      lastInvokeTime.current = time;
      
      result.current = funcRef.current.apply(thisArg, args as any);
      return result.current;
    };

    const startTimer = (pendingFunc: () => void, wait: number) => {
      if (useRAF) cancelAnimationFrame(timerId.current!);

      timerId.current = useRAF
        ? requestAnimationFrame(pendingFunc)
        : window.setTimeout(pendingFunc, wait);
    };

    const shouldInvoke = (time: number) => {
      if (!mounted.current) return false;

      const timeSinceLastCall = time - (lastCallTime.current ?? 0);
      const timeSinceLastInvoke = time - lastInvokeTime.current;

      return (
        !lastCallTime.current ||
        timeSinceLastCall >= waitMs ||
        timeSinceLastCall < 0 ||
        (maxing && timeSinceLastInvoke >= (maxWait ?? 0))
      );
    };

    const trailingEdge = (time: number) => {
      timerId.current = null;

      if (trailing && lastArgs.current) {
        return invokeFunc(time);
      }

      lastArgs.current = lastThis.current = null;
      return result.current;
    };

    const timerExpired = () => {
      const time = Date.now();

      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }

      if (!mounted.current) {
        return;
      }

      const timeSinceLastCall = time - (lastCallTime.current ?? 0);
      const timeSinceLastInvoke = time - lastInvokeTime.current;
      const timeWaiting = waitMs - timeSinceLastCall;
      const remainingWait = maxing
        ? Math.min(timeWaiting, (maxWait ?? 0) - timeSinceLastInvoke)
        : timeWaiting;

      startTimer(timerExpired, remainingWait);
    };

    const debouncedFunction = function(this: any, ...args: Parameters<T>): ReturnType<T> | undefined {
      if (!isClientSize && !debounceOnServer) {
        return undefined;
      }

      const time = Date.now();
      const isInvoking = shouldInvoke(time);

      lastArgs.current = args;
      lastThis.current = this;
      lastCallTime.current = time;

      if (isInvoking) {
        if (!timerId.current && mounted.current) {
          lastInvokeTime.current = lastCallTime.current;
          startTimer(timerExpired, waitMs);
          return leading ? invokeFunc(lastCallTime.current) : result.current;
        }
        if (maxing) {
          startTimer(timerExpired, waitMs);
          return invokeFunc(lastCallTime.current);
        }
      }
      if (!timerId.current) {
        startTimer(timerExpired, waitMs);
      }

      return result.current;
    } as DebouncedState<T>;

    debouncedFunction.cancel = () => {
      if (timerId.current) {
        useRAF
          ? cancelAnimationFrame(timerId.current)
          : clearTimeout(timerId.current);
      }
      lastInvokeTime.current = 0;
      lastArgs.current = lastCallTime.current = lastThis.current = timerId.current = null;
    };

    debouncedFunction.isPending = () => {
      return !!timerId.current;
    };

    debouncedFunction.flush = () => {
      return timerId.current ? trailingEdge(Date.now()) : result.current;
    };

    return debouncedFunction;
  }, [
    leading,
    maxing,
    waitMs,
    maxWait,
    trailing,
    useRAF,
    isClientSize,
    debounceOnServer,
  ]);

  return debounced;
}