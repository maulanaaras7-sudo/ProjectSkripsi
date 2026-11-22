"use client";

import { useEffect, useRef } from "react";

type MathJaxApi = {
  startup?: { promise?: Promise<unknown> };
  typesetClear?: (elements?: Element[]) => void;
  typesetPromise?: (elements?: Element[]) => Promise<unknown>;
};

declare global { interface Window { MathJax?: MathJaxApi } }

/** Renders trusted TeX supplied by the application or its question bank. */
export function MathText({ children, className }: { children:string; className?:string }) {
  const element = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const typeset = () => {
      const api = window.MathJax;
      const target = element.current;
      if (!api || !target) {
        if (++attempts < 30) window.setTimeout(typeset, 100);
        return;
      }
      void (api.startup?.promise ?? Promise.resolve()).then(() => {
        if (cancelled || !element.current) return;
        api.typesetClear?.([element.current]);
        return api.typesetPromise?.([element.current]);
      });
    };
    typeset();
    return () => { cancelled = true; };
  }, [children]);
  return <span className={className} ref={element}>{children}</span>;
}
