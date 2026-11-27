import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Platform, Animated, Dimensions } from "react-native";
import Svg, { Defs, RadialGradient as SvgRadialGradient, Stop, Rect } from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Where each light starts, its pace and start offset
const LIGHTS_CONFIG = [
  { left: "-15%", top: "-25%", pace: 1, color: "#38bdf8", id: "aurora1" },
  { left: "35%", top: "-15%", pace: 1.35, color: "#a78bfa", id: "aurora2" },
  { left: "10%", top: "35%", pace: 1.7, color: "#f472b6", id: "aurora3" },
];

export interface AuroraProps {
  colors?: [string, string, string];
  duration?: number;
  intensity?: number;
  style?: any;
  className?: string;
  children?: React.ReactNode;
}

export const Aurora: React.FC<AuroraProps> = ({
  colors = ["#38bdf8", "#a78bfa", "#f472b6"],
  duration = 18,
  intensity = 0.45,
  style,
  className,
  children,
}) => {
  // -------------------------------------------------------------
  // Native (Android & iOS): Animated SVG Radial Glows
  // Continuously drifts with React Native Animated for silky smooth 60fps
  // -------------------------------------------------------------
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

  if (Platform.OS !== "web") {
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
          {/* Light 1: Sky Blue (#38bdf8) */}
          <Animated.View
            style={[
              styles.nativeLightBlob,
              {
                left: "-15%",
                top: "-20%",
                width: "90%",
                height: "65%",
                transform: [{ translateX: transX1 }, { translateY: transY1 }],
              },
            ]}
          >
            <Svg width="100%" height="100%" viewBox="0 0 100 100">
              <Defs>
                <SvgRadialGradient id="grad1" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor={colors[0] || "#38bdf8"} stopOpacity={intensity * 0.75} />
                  <Stop offset="60%" stopColor={colors[0] || "#38bdf8"} stopOpacity={intensity * 0.25} />
                  <Stop offset="100%" stopColor={colors[0] || "#38bdf8"} stopOpacity={0} />
                </SvgRadialGradient>
              </Defs>
              <Rect x="0" y="0" width="100" height="100" fill="url(#grad1)" />
            </Svg>
          </Animated.View>

          {/* Light 2: Soft Violet/Purple (#a78bfa) */}
          <Animated.View
            style={[
              styles.nativeLightBlob,
              {
                right: "-20%",
                top: "10%",
                width: "85%",
                height: "60%",
                transform: [{ translateX: transX2 }, { translateY: transY2 }],
              },
            ]}
          >
            <Svg width="100%" height="100%" viewBox="0 0 100 100">
              <Defs>
                <SvgRadialGradient id="grad2" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor={colors[1] || "#a78bfa"} stopOpacity={intensity * 0.7} />
                  <Stop offset="60%" stopColor={colors[1] || "#a78bfa"} stopOpacity={intensity * 0.2} />
                  <Stop offset="100%" stopColor={colors[1] || "#a78bfa"} stopOpacity={0} />
                </SvgRadialGradient>
              </Defs>
              <Rect x="0" y="0" width="100" height="100" fill="url(#grad2)" />
            </Svg>
          </Animated.View>

          {/* Light 3: Pink/Magenta (#f472b6) */}
          <Animated.View
            style={[
              styles.nativeLightBlob,
              {
                left: "10%",
                bottom: "10%",
                width: "80%",
                height: "55%",
                transform: [{ translateX: transX3 }, { translateY: transY3 }],
              },
            ]}
          >
            <Svg width="100%" height="100%" viewBox="0 0 100 100">
              <Defs>
                <SvgRadialGradient id="grad3" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor={colors[2] || "#f472b6"} stopOpacity={intensity * 0.65} />
                  <Stop offset="60%" stopColor={colors[2] || "#f472b6"} stopOpacity={intensity * 0.18} />
                  <Stop offset="100%" stopColor={colors[2] || "#f472b6"} stopOpacity={0} />
                </SvgRadialGradient>
              </Defs>
              <Rect x="0" y="0" width="100" height="100" fill="url(#grad3)" />
            </Svg>
          </Animated.View>
        </View>

        {/* Content Layer */}
        {children ? <View style={styles.nativeContent}>{children}</View> : null}
      </View>
    );
  }

  // -------------------------------------------------------------
  // Web: CSS Radial Gradients with Continuous Keyframe Transforms
  // -------------------------------------------------------------
  return (
    <div
      data-slot="aurora"
      className={`relative isolate overflow-hidden ${className || ""}`}
      style={{
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#07090E",
        width: "100%",
        minHeight: "100%",
        ...(style || {}),
      }}
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
          animation-play-state: running !important;
        }
      `}</style>

      {/* Floating Lights Layer */}
      <div
        aria-hidden="true"
        data-slot="aurora-lights"
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        {LIGHTS_CONFIG.map((light, index) => (
          <span
            key={index}
            className="animate-aurora"
            style={{
              position: "absolute",
              width: "75%",
              height: "75%",
              borderRadius: "9999px",
              left: light.left,
              top: light.top,
              background: `radial-gradient(closest-side, ${colors[index] || light.color}, transparent)`,
              opacity: intensity,
              animationDuration: `${duration * light.pace}s`,
              animationDelay: `${-1 * index * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Content Layer */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
        {children}
      </div>
    </div>
  );
};

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
