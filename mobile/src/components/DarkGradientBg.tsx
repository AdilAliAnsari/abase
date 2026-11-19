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
  duration = 20,
  intensity = 0.35,
}) => {
  if (Platform.OS === "web") {
    return (
      <div
        className={`relative min-h-screen w-full overflow-hidden ${className}`}
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "#06080C",
          overflow: "hidden",
        }}
      >
        {/* Fixed Background Aurora Layer */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            pointerEvents: "none",
          }}
        >
          <Aurora
            className="w-full h-full"
            colors={colors}
            duration={duration}
            intensity={intensity}
            style={{ width: "100%", height: "100%" }}
          />
        </div>

        {/* Content Layer */}
        <div
          className="relative z-10"
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            flex: 1,
            pointerEvents: "auto",
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  // Native (iOS/Android)
  return (
    <View style={[styles.nativeContainer, style]}>
      <Aurora colors={colors} duration={duration} intensity={intensity}>
        <View style={styles.contentLayer}>{children}</View>
      </Aurora>
    </View>
  );
};

const styles = StyleSheet.create({
  nativeContainer: {
    flex: 1,
    backgroundColor: "#06080C",
    position: "relative",
    overflow: "hidden",
  },
  contentLayer: {
    flex: 1,
    zIndex: 10,
    backgroundColor: "transparent",
  },
});

export default DarkGradientBg;
