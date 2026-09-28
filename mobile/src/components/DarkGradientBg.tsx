import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { ShaderBackground } from "./ShaderBackground";

export interface DarkGradientBgProps {
  children?: React.ReactNode;
  style?: any;
  className?: string;
}

export const DarkGradientBg: React.FC<DarkGradientBgProps> = ({
  children,
  style,
  className = "",
}) => {
  if (Platform.OS === "web") {
    return (
      <div
        className={`relative min-h-screen w-full overflow-hidden bg-black ${className}`}
        style={{
          position: "relative",
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "#000000",
          overflow: "hidden",
        }}
      >
        {/* WebGL Mesh Drift Shader Background */}
        <ShaderBackground className="absolute inset-0 h-full w-full" />

        {/* Content */}
        <div
          className="relative z-10"
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            flex: 1,
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
      {/* 3D WebGL Shader Background */}
      <ShaderBackground />

      {/* Children Content */}
      <View style={styles.contentLayer}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  nativeContainer: {
    flex: 1,
    backgroundColor: "#000000",
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
