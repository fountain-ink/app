import { useState } from "react";

/**
 * Returns the memoized value of a function, updating it only when its
 * dependencies change.
 */
export const useSafeMemo = (fn: any, deps: any) => {
  const [[currValue, currDeps], set] = useState(() => [fn(), deps]);
  let value = currValue;
  const changed = deps.length !== currDeps.length || deps.some((dep: any, i: any) => dep !== currDeps[i]);

  if (changed) {
    value = fn();
    set([value, deps]);
  }

  return value;
};
