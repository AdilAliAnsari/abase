import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export type BorderBeamSize = "sm" | "md" | "lg" | number;
export type BorderBeamColorVariant =
  | "colorful"
  | "purple"
  | "cyan"
  | "green"
  | "amber"
  | "rainbow";
export type BorderBeamTheme = "dark" | "light";

export interface BorderBeamProps {
  children?: React.ReactNode;
  size?: BorderBeamSize;
  duration?: number;
  borderWidth?: number;
  borderRadius?: number;
  colorVariant?: BorderBeamColorVariant;
  colorFrom?: string;
  colorTo?: string;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

const COLOR_VARIANTS: Record<BorderBeamColorVariant, readonly [string, string, ...string[]]> = {
  colorful: [
    "rgba(0, 0, 0, 0)",
    "rgba(255, 255, 255, 0.8)",
    "#FFFFFF",
    "#FFFFFF",
    "rgba(255, 255, 255, 0.6)",
    "rgba(0, 0, 0, 0)",
  ] as const,
  purple: [
    "rgba(0, 0, 0, 0)",
    "rgba(123, 97, 255, 0.1)",
    "#7B61FF",
    "#B19EEF",
    "#5227FF",
    "rgba(0, 0, 0, 0)",
  ] as const,
  cyan: [
    "rgba(0, 0, 0, 0)",
    "rgba(255, 255, 255, 0.1)",
    "#FFFFFF",
    "#FFFFFF",
    "rgba(255, 255, 255, 0.6)",
    "rgba(0, 0, 0, 0)",
  ] as const,
  green: [
    "rgba(0, 0, 0, 0)",
    "rgba(255, 255, 255, 0.1)",
    "#FFFFFF",
    "#FFFFFF",
    "rgba(255, 255, 255, 0.8)",
    "rgba(0, 0, 0, 0)",
  ] as const,
  amber: [
    "rgba(0, 0, 0, 0)",
    "rgba(255, 255, 255, 0.1)",
    "#FFFFFF",
    "#FFFFFF",
    "rgba(255, 255, 255, 0.8)",
    "rgba(0, 0, 0, 0)",
  ] as const,
  rainbow: [
    "rgba(0, 0, 0, 0)",
    "#FF0080",
    "#7928CA",
    "#0070F3",
    "#00DFD8",
    "#7928CA",
    "rgba(0, 0, 0, 0)",
  ] as const,
};

export const BorderBeam: React.FC<BorderBeamProps> = ({
  children,
  size = "md",
  duration = 5,
  borderWidth = 1.5,
  borderRadius = 22,
  colorVariant = "colorful",
  colorFrom,
  colorTo,
  style,
  containerStyle,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: duration * 1000,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== "web",
      })
    );
    loop.start();

    return () => {
      loop.stop();
    };
  }, [duration, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const gradientColors = colorFrom && colorTo
    ? ([
        "rgba(0, 0, 0, 0)",
        colorFrom,
        colorTo,
        colorFrom,
        "rgba(0, 0, 0, 0)",
      ] as const)
    : COLOR_VARIANTS[colorVariant] || COLOR_VARIANTS.colorful;

  const innerBorderRadius = Math.max(0, borderRadius - borderWidth);

  return (
    <View
      style={[
        styles.outerContainer,
        {
          borderRadius,
          padding: borderWidth,
        },
        containerStyle,
      ]}
    >
      {/* Rotating gradient beam layer */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius,
            overflow: "hidden",
          },
        ]}
      >
        <Animated.View
          style={[
            styles.animatedGradientWrapper,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          />
        </Animated.View>
      </View>

      {/* Inner child container */}
      <View
        style={[
          styles.innerContent,
          {
            borderRadius: innerBorderRadius,
          },
          style,
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: "relative",
    overflow: "hidden",
    alignSelf: "stretch",
  },
  animatedGradientWrapper: {
    position: "absolute",
    width: "250%",
    height: "250%",
    top: "-75%",
    left: "-75%",
    alignItems: "center",
    justifyContent: "center",
  },
  gradient: {
    width: "100%",
    height: "100%",
  },
  innerContent: {
    backgroundColor: "#14131E",
    overflow: "hidden",
  },
});

export default BorderBeam;
