import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import VelvetHaze, { HazeParams, HAZE_PRESETS } from "./ui/velvet-haze";

export interface DarkGradientBgProps {
  children?: React.ReactNode;
  style?: any;
  className?: string;
  preset?: keyof typeof HAZE_PRESETS;
  params?: Partial<HazeParams>;
  interactive?: boolean;
}

export const DarkGradientBg: React.FC<DarkGradientBgProps> = ({
  children,
  style,
  className = "",
  preset = "velvet",
  params,
  interactive = true,
}) => {
  if (Platform.OS === "web") {
    return (
      <div
        className={`relative min-h-screen w-full overflow-hidden ${className}`}
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "#111112",
          overflow: "hidden",
        }}
      >
        {/* Velvet Haze Raw WebGL2 Canvas Pass */}
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
            pointerEvents: "auto",
          }}
        >
          <VelvetHaze
            height="100%"
            preset={preset}
            params={params}
            interactive={interactive}
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
      <VelvetHaze preset={preset} params={params} interactive={interactive}>
        <View style={styles.contentLayer}>{children}</View>
      </VelvetHaze>
    </View>
  );
};

const styles = StyleSheet.create({
  nativeContainer: {
    flex: 1,
    backgroundColor: "#111112",
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
