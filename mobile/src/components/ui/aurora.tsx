"use client";

import React, { useMemo, type ComponentProps, type Ref } from "react";
import { Platform, View, StyleSheet } from "react-native";

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

function parseSafeNativeColor(colorStr: string | undefined, defaultColor: string): string {
  if (!colorStr) return defaultColor;
  const str = colorStr.trim();
  if (str.startsWith("var(")) {
    const match = str.match(/,\s*([^)]+)\)/);
    if (match && match[1]) {
      return parseSafeNativeColor(match[1].trim(), defaultColor);
    }
    return defaultColor;
  }
  if (str.toLowerCase() === "transparent") {
    return "rgba(6, 8, 12, 0)";
  }
  if (str.startsWith("#") || str.startsWith("rgba(") || str.startsWith("rgb(")) {
    return str;
  }
  return defaultColor;
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
 */
export const Aurora = React.forwardRef<HTMLDivElement, AuroraProps>(
  function Aurora(
    {
      colors = [
        "rgba(255, 255, 255, 0.75)",
        "rgba(255, 255, 255, 0.45)",
        "rgba(255, 255, 255, 0.25)",
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
    // Native (iOS / Android) with matching soft monochrome ambient lights
    // Pure Views with radial glow boundaries — 100% crash-free on all devices & Expo Go
    // -------------------------------------------------------------
    if (Platform.OS !== "web") {
      const alpha0 = Math.min(0.25, Math.max(0.04, intensity * 0.28));
      const alpha1 = Math.min(0.18, Math.max(0.03, intensity * 0.20));
      const alpha2 = Math.min(0.14, Math.max(0.02, intensity * 0.15));

      return (
        <View style={[{ flex: 1, backgroundColor: "#06080C", position: "relative", overflow: "hidden" }, style]}>
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* Light 1: Soft top-left ambient glow */}
            <View
              style={{
                position: "absolute",
                left: "-20%",
                top: "-25%",
                width: "85%",
                height: "65%",
                borderRadius: 9999,
                backgroundColor: `rgba(255, 255, 255, ${alpha0})`,
              }}
            />
            {/* Light 2: Soft top-right ambient glow */}
            <View
              style={{
                position: "absolute",
                right: "-20%",
                top: "-15%",
                width: "80%",
                height: "60%",
                borderRadius: 9999,
                backgroundColor: `rgba(255, 255, 255, ${alpha1})`,
              }}
            />
            {/* Light 3: Soft center-bottom ambient glow */}
            <View
              style={{
                position: "absolute",
                left: "10%",
                bottom: "15%",
                width: "75%",
                height: "55%",
                borderRadius: 9999,
                backgroundColor: `rgba(255, 255, 255, ${alpha2})`,
              }}
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

