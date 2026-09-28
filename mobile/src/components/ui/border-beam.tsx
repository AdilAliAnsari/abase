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
    "transparent",
    "rgba(82, 39, 255, 0.8)",
    "#FF9FFC",
    "#00E5FF",
    "rgba(0, 229, 255, 0.6)",
    "transparent",
  ] as const,
  purple: [
    "transparent",
    "rgba(123, 97, 255, 0.1)",
    "#7B61FF",
    "#B19EEF",
    "#5227FF",
    "transparent",
  ] as const,
  cyan: [
    "transparent",
    "rgba(0, 229, 255, 0.1)",
    "#00E5FF",
    "#69D900",
    "#0D9488",
    "transparent",
  ] as const,
  green: [
    "transparent",
    "rgba(105, 217, 0, 0.1)",
    "#69D900",
    "#7BEA12",
    "#00E5FF",
    "transparent",
  ] as const,
  amber: [
    "transparent",
    "rgba(255, 160, 0, 0.1)",
    "#FFA000",
    "#FF5A2B",
    "#FFD814",
    "transparent",
  ] as const,
  rainbow: [
    "transparent",
    "#FF0080",
    "#7928CA",
    "#0070F3",
    "#00DFD8",
    "#7928CA",
    "transparent",
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
        "transparent",
        colorFrom,
        colorTo,
        colorFrom,
        "transparent",
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
