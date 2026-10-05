export interface ScrollTarget {
  style: { overflow: string };
}

export function createScrollLock(getTarget: () => ScrollTarget | null) {
  let count = 0;
  let saved = "";

  return {
    lock(): () => void {
      const target = getTarget();
      if (!target) return () => {};

      if (count === 0) {
        saved = target.style.overflow;
        target.style.overflow = "hidden";
      }
      count += 1;

      let released = false;
      return () => {
        if (released) return;
        released = true;
        count -= 1;
        if (count === 0) target.style.overflow = saved;
      };
    },
  };
}

export const bodyScrollLock = createScrollLock(() =>
  typeof document === "undefined" ? null : document.body
);
