import { useEffect, useRef, useState } from "react";

type Options = { once?: boolean; margin?: string; amount?: number };

/**
 * Tracks whether an element is inside the viewport.
 * SSR-safe: falls back to "visible" when IntersectionObserver is unavailable
 * so server-rendered content is never hidden.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(options?: Options) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            if (options?.once) observer.disconnect();
          } else if (!options?.once) {
            setInView(false);
          }
        }
      },
      { rootMargin: options?.margin ?? "0px 0px -12% 0px", threshold: options?.amount ?? 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [options?.once, options?.margin, options?.amount]);

  return { ref, inView };
}
