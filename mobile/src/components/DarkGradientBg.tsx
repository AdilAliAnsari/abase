import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import Aurora from "./ui/aurora";

export interface DarkGradientBgProps {
  children?: React.ReactNode;
  style?: any;
  className?: string;
  colors?: [string, string, string];
  duration?: number;
  intensity?: number;
}

export const DarkGradientBg: React.FC<DarkGradientBgProps> = ({
  children,
  style,
  className = "",
  colors = ["#38bdf8", "#a78bfa", "#f472b6"],
  duration = 18,
  intensity = 0.45,
}) => {
  if (Platform.OS === "web") {
    return (
      <Aurora
        colors={colors}
        duration={duration}
        intensity={intensity}
        style={{
          minHeight: "100vh",
          width: "100%",
          backgroundColor: "#07090E",
          display: "flex",
          flexDirection: "column",
        }}
        className={className}
      >
        <div
          style={{
            minHeight: "100vh",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            zIndex: 5,
          }}
        >
          {children}
        </div>
      </Aurora>
    );
  }

  // Native (iOS/Android)
  return (
    <Aurora colors={colors} duration={duration} intensity={intensity} style={style}>
      <View style={styles.nativeContent}>{children}</View>
    </Aurora>
  );
};

const styles = StyleSheet.create({
  nativeContent: {
    flex: 1,
    backgroundColor: "transparent",
  },
});

export default DarkGradientBg;
