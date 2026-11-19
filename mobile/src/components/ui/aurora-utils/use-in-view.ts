import { useState, useRef, useCallback } from "react";

export interface UseInViewOptions {
  rootMargin?: string;
  threshold?: number | number[];
}

export function useInView<T extends HTMLElement = HTMLDivElement>({
  rootMargin = "200px",
  threshold = 0,
}: UseInViewOptions = {}) {
  const [inView, setInView] = useState(true);
  const elementRef = useRef<T | null>(null);

  const observe = useCallback(
    (node: T | null) => {
      elementRef.current = node;
      if (!node || typeof IntersectionObserver === "undefined") {
        setInView(true);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          setInView(entry.isIntersecting);
        },
        { rootMargin, threshold }
      );

      observer.observe(node);

      return () => {
        observer.disconnect();
      };
    },
    [rootMargin, threshold]
  );

  return [observe, inView] as const;
}

export default useInView;

