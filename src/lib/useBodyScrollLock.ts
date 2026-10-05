"use client";

import { useEffect } from "react";
import { bodyScrollLock } from "@/lib/scrollLock";

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    return bodyScrollLock.lock();
  }, [active]);
}
