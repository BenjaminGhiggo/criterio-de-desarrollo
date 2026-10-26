import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { useInView } from "@/hooks/use-in-view";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Fades + lifts children into place the first time they enter the viewport. */
export function Reveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
  once = true,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  once?: boolean;
}) {
  const { ref, inView } = useInView<HTMLElement>({ once });
  return (
    <Tag
      ref={ref as never}
      className={`reveal ${inView ? "is-visible" : ""} ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

function parseValue(value: string) {
  const match = value.match(/^([^0-9-]*)(-?[0-9]*\.?[0-9]+)(.*)$/);
  if (!match) return null;
  const [, prefix = "", digits = "0", suffix = ""] = match;
  const decimals = digits.split(".")[1]?.length ?? 0;
  return { prefix, target: parseFloat(digits), decimals, suffix };
}

/** Animates a numeric value from 0 to its target once it scrolls into view. */
export function CountUp({
  value,
  className = "",
  duration = 1300,
}: {
  value: string;
  className?: string;
  duration?: number;
}) {
  const parsed = parseValue(value);
  const { ref, inView } = useInView<HTMLSpanElement>({ once: true });
  // Render the FINAL value on the server and first client paint so hydration
  // matches exactly; the count-up only starts after mount, on the client.
  const [display, setDisplay] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    if (!parsed || !inView || started.current) return;
    if (prefersReducedMotion()) {
      setDisplay(value);
      return;
    }
    started.current = true;
    setDisplay(`${parsed.prefix}0${parsed.suffix}`);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(
        `${parsed.prefix}${(parsed.target * eased).toFixed(parsed.decimals)}${parsed.suffix}`,
      );
      if (progress < 1) raf = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, parsed, value, duration]);

  if (!parsed) return <span className={className}>{value}</span>;
  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}

/** A number that gently drifts around a base value to feel "live" (telemetry look). */
export function LiveTicker({
  base,
  spread = 6,
  decimals = 0,
  suffix = "",
  className = "",
  intervalMs = 2200,
}: {
  base: number;
  spread?: number;
  decimals?: number;
  suffix?: string;
  className?: string;
  intervalMs?: number;
}) {
  const [value, setValue] = useState(base);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let tick = 0;
    const id = setInterval(() => {
      tick += 1;
      // deterministic-ish oscillation so it feels alive but not jittery
      const wobble = Math.sin(tick * 1.7) * spread * 0.6 + Math.cos(tick * 0.9) * spread * 0.4;
      setValue(base + wobble);
    }, intervalMs);
    return () => clearInterval(id);
  }, [base, spread, intervalMs]);
  return (
    <span className={className}>
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
}
