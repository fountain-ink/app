import * as React from "react";
import { startTransition } from "react";

/**
 * Debounces the given value by delaying its update.
 *
 * @param value - The value to be debounced.
 * @param [delay=500] - The delay in milliseconds before updating the debounced
 *   value. Default is `500`
 */
export const useDebounce = <T>(value: T, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler: NodeJS.Timeout = setTimeout(() => {
      startTransition(() => {
        setDebouncedValue(value);
      });
    }, delay);

    // Cancel the timeout if value changes (also on delay change or unmount)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
