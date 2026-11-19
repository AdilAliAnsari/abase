"use client";

import React, { useMemo, type ComponentProps, type Ref } from "react";
import { Platform, View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useInView } from "./aurora-utils/use-in-view";
import { cn } from "../../lib/utils";

function mergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref && typeof ref === "object") (ref as any).current = node;
    }
  };
}

// Where each light starts, how much slower than `duration` it drifts, and
// how far into its drift it begins, so the three never move in step.
const LIGHTS = [
  { left: "-15%", top: "-30%", pace: 1, start: 0 },
  { left: "40%", top: "-15%", pace: 1.35, start: -0.3 },
  { left: "10%", top: "35%", pace: 1.7, start: -0.65 },
];

export interface AuroraProps extends ComponentProps<"div"> {
  /** Three CSS colours, one per light. Theme variables work. */
  colors?: [string, string, string];
  /** Seconds for the fastest light to finish one drift. */
  duration?: number;
  /** Opacity of the lights, from 0 to 1. */
  intensity?: number;
  style?: any;
}

/**
 * Slow, soft light drifting behind its content. Three radial gradients
 * moved with transforms only: no blur filters, no canvas. The lights pause
 * while off screen and hold still with `prefers-reduced-motion`.
 *
 * @example
 * <Aurora className="rounded-xl border p-10" colors={["#38bdf8", "#a78bfa", "#f472b6"]}>
 *   <h2>…</h2>
 * </Aurora>
 */
export const Aurora = React.forwardRef<HTMLDivElement, AuroraProps>(
  function Aurora(
    {
      colors = [
        "var(--primary, #FFFFFF)",
        "var(--muted-foreground, rgba(255, 255, 255, 0.75))",
        "var(--accent-foreground, rgba(255, 255, 255, 0.45))",
      ],
      duration = 20,
      intensity = 0.35,
      className,
      children,
      style,
      ...props
    },
    ref
  ) {
    // -------------------------------------------------------------
    // Native (iOS / Android) with matching soft drifting ambient lights
    // -------------------------------------------------------------
    if (Platform.OS !== "web") {
      const c0 = colors[0]?.includes("#") ? colors[0] : "#38bdf8";
      const c1 = colors[1]?.includes("#") ? colors[1] : "#a78bfa";
      const c2 = colors[2]?.includes("#") ? colors[2] : "#f472b6";

      return (
        <View style={[{ flex: 1, backgroundColor: "#06080C", position: "relative" }, style]}>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* Light 1 */}
            <LinearGradient
              colors={[c0, "transparent"]}
              start={{ x: 0.05, y: 0.0 }}
              end={{ x: 0.75, y: 0.65 }}
              style={[StyleSheet.absoluteFill, { opacity: intensity }]}
            />
            {/* Light 2 */}
            <LinearGradient
              colors={[c1, "transparent"]}
              start={{ x: 0.85, y: 0.05 }}
              end={{ x: 0.35, y: 0.75 }}
              style={[StyleSheet.absoluteFill, { opacity: intensity }]}
            />
            {/* Light 3 */}
            <LinearGradient
              colors={[c2, "transparent"]}
              start={{ x: 0.45, y: 0.55 }}
              end={{ x: 0.9, y: 0.95 }}
              style={[StyleSheet.absoluteFill, { opacity: intensity * 0.85 }]}
            />
          </View>
          {children ? <View style={{ flex: 1, zIndex: 10 }}>{children}</View> : null}
        </View>
      );
    }

    // -------------------------------------------------------------
    // Web: CSS Radial Gradients with Transform animations
    // -------------------------------------------------------------
    const [observe, inView] = useInView<HTMLDivElement>({ rootMargin: "200px" });
    const mergedRef = useMemo(() => mergeRefs(ref, observe), [ref, observe]);

    return (
      <div
        ref={mergedRef}
        data-slot="aurora"
        className={cn("relative isolate overflow-hidden", className)}
        style={{
          position: "relative",
          overflow: "hidden",
          ...(style || {}),
        }}
        {...props}
      >
        <style>{`
          @keyframes aurora-drift {
            0% {
              transform: translate(0, 0) scale(1);
            }
            33% {
              transform: translate(24%, 18%) scale(1.15);
            }
            66% {
              transform: translate(-14%, 26%) scale(0.92);
            }
            100% {
              transform: translate(0, 0) scale(1);
            }
          }
          .animate-aurora {
            animation-name: aurora-drift;
            animation-timing-function: ease-in-out;
            animation-iteration-count: infinite;
            animation-direction: alternate;
          }
          @media (prefers-reduced-motion: reduce) {
            .animate-aurora {
              animation: none !important;
            }
          }
        `}</style>
        <div
          aria-hidden="true"
          data-slot="aurora-lights"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            pointerEvents: "none",
            position: "absolute",
            inset: 0,
            zIndex: 0,
          }}
        >
          {LIGHTS.map((light, index) => (
            <span
              key={index}
              className="animate-aurora absolute size-[75%] rounded-full motion-reduce:animate-none"
              style={{
                position: "absolute",
                width: "75%",
                height: "75%",
                borderRadius: "9999px",
                left: light.left,
                top: light.top,
                background: `radial-gradient(closest-side, ${colors[index]}, transparent)`,
                opacity: intensity,
                animationDuration: `${duration * light.pace}s`,
                animationDelay: `${duration * light.start}s`,
                animationPlayState: inView ? "running" : "paused",
              }}
            />
          ))}
        </div>
        {children}
      </div>
    );
  }
);

export default Aurora;

