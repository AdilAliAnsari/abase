"use client";

import React, { useMemo, useEffect, useRef, type ComponentProps, type Ref } from "react";
import { View, StyleSheet, Platform, Animated } from "react-native";
import Svg, { Defs, RadialGradient as SvgRadialGradient, Stop, Rect } from "react-native-svg";
import { useInView } from "./aurora-utils/use-in-view";
import { cn } from "../../lib/utils";

function mergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<T | null>).current = node;
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

export interface AuroraProps {
  /** Three CSS colours, one per light. Theme variables work. */
  colors?: [string, string, string];
  /** Seconds for the fastest light to finish one drift. */
  duration?: number;
  /** Opacity of the lights, from 0 to 1. */
  intensity?: number;
  className?: string;
  style?: any;
  children?: React.ReactNode;
  ref?: any;
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
export function Aurora({
  colors = [
    "var(--primary, #38bdf8)",
    "var(--muted-foreground, #a78bfa)",
    "var(--accent-foreground, #f472b6)",
  ],
  duration = 20,
  intensity = 0.35,
  className,
  style,
  children,
  ref,
  ...props
}: AuroraProps) {
  const [observe, inView] = useInView<HTMLDivElement>({ rootMargin: "200px" });
  const mergedRef = useMemo(() => mergeRefs(ref, observe), [ref, observe]);

  // Native React Native Animated Drift
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS === "web") return;

    const createDriftLoop = (anim: Animated.Value, dur: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: dur * 500,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 2,
            duration: dur * 500,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: dur * 500,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const l1 = createDriftLoop(anim1, duration * 1.0);
    const l2 = createDriftLoop(anim2, duration * 1.35);
    const l3 = createDriftLoop(anim3, duration * 1.7);

    l1.start();
    l2.start();
    l3.start();

    return () => {
      l1.stop();
      l2.stop();
      l3.stop();
    };
  }, [anim1, anim2, anim3, duration]);

  if (Platform.OS === "web") {
    return (
      <div
        ref={mergedRef}
        data-slot="aurora"
        className={cn("relative isolate overflow-hidden", className)}
        style={{
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#07090E",
          width: "100%",
          minHeight: "100%",
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
              transform: translate(18%, 14%) scale(1.15);
            }
            66% {
              transform: translate(-12%, 20%) scale(0.92);
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
            overflow: "hidden",
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
        <div style={{ position: "relative", zIndex: 1, width: "100%", minHeight: "100%" }}>
          {children}
        </div>
      </div>
    );
  }

  // Native (Android & iOS)
  const nativeColor1 = colors[0]?.startsWith("var") ? "#38bdf8" : (colors[0] || "#38bdf8");
  const nativeColor2 = colors[1]?.startsWith("var") ? "#a78bfa" : (colors[1] || "#a78bfa");
  const nativeColor3 = colors[2]?.startsWith("var") ? "#f472b6" : (colors[2] || "#f472b6");

  const transX1 = anim1.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 50, -30],
  });
  const transY1 = anim1.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 35, 60],
  });

  const transX2 = anim2.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, -60, 40],
  });
  const transY2 = anim2.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 50, -25],
  });

  const transX3 = anim3.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 45, -50],
  });
  const transY3 = anim3.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, -40, 30],
  });

  return (
    <View style={[styles.nativeContainer, style]}>
      {/* Background Lights Layer */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Light 1 */}
        <Animated.View
          style={[
            styles.nativeLightBlob,
            {
              left: LIGHTS[0].left,
              top: LIGHTS[0].top,
              width: "90%",
              height: "65%",
              transform: [{ translateX: transX1 }, { translateY: transY1 }],
            },
          ]}
        >
          <Svg width="100%" height="100%" viewBox="0 0 100 100">
            <Defs>
              <SvgRadialGradient id="auroraGrad1" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={nativeColor1} stopOpacity={intensity * 0.85} />
                <Stop offset="60%" stopColor={nativeColor1} stopOpacity={intensity * 0.3} />
                <Stop offset="100%" stopColor={nativeColor1} stopOpacity={0} />
              </SvgRadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100" height="100" fill="url(#auroraGrad1)" />
          </Svg>
        </Animated.View>

        {/* Light 2 */}
        <Animated.View
          style={[
            styles.nativeLightBlob,
            {
              left: LIGHTS[1].left,
              top: LIGHTS[1].top,
              width: "85%",
              height: "60%",
              transform: [{ translateX: transX2 }, { translateY: transY2 }],
            },
          ]}
        >
          <Svg width="100%" height="100%" viewBox="0 0 100 100">
            <Defs>
              <SvgRadialGradient id="auroraGrad2" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={nativeColor2} stopOpacity={intensity * 0.8} />
                <Stop offset="60%" stopColor={nativeColor2} stopOpacity={intensity * 0.25} />
                <Stop offset="100%" stopColor={nativeColor2} stopOpacity={0} />
              </SvgRadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100" height="100" fill="url(#auroraGrad2)" />
          </Svg>
        </Animated.View>

        {/* Light 3 */}
        <Animated.View
          style={[
            styles.nativeLightBlob,
            {
              left: LIGHTS[2].left,
              top: LIGHTS[2].top,
              width: "80%",
              height: "55%",
              transform: [{ translateX: transX3 }, { translateY: transY3 }],
            },
          ]}
        >
          <Svg width="100%" height="100%" viewBox="0 0 100 100">
            <Defs>
              <SvgRadialGradient id="auroraGrad3" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor={nativeColor3} stopOpacity={intensity * 0.75} />
                <Stop offset="60%" stopColor={nativeColor3} stopOpacity={intensity * 0.2} />
                <Stop offset="100%" stopColor={nativeColor3} stopOpacity={0} />
              </SvgRadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100" height="100" fill="url(#auroraGrad3)" />
          </Svg>
        </Animated.View>
      </View>

      {/* Content Layer */}
      {children ? <View style={styles.nativeContent}>{children}</View> : null}
    </View>
  );
}

// --- Demo ---
export function AuroraDemo() {
  return (
    <Aurora className="flex h-screen w-full items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h2 className="text-3xl font-semibold">Aurora</h2>
        <p className="mt-2 text-muted-foreground">
          Soft light drifting behind your content.
        </p>
      </div>
    </Aurora>
  );
}

const styles = StyleSheet.create({
  nativeContainer: {
    flex: 1,
    backgroundColor: "#07090E",
    position: "relative",
    overflow: "hidden",
  },
  nativeLightBlob: {
    position: "absolute",
  },
  nativeContent: {
    flex: 1,
    zIndex: 10,
    backgroundColor: "transparent",
  },
});

export default Aurora;
