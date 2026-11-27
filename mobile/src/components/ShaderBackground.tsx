import React from "react";
import VelvetHaze, { VelvetHazeProps } from "./ui/velvet-haze";

export interface ShaderBackgroundProps extends VelvetHazeProps {
  className?: string;
}

export function ShaderBackground(props: ShaderBackgroundProps) {
  return <VelvetHaze height="100%" interactive={true} {...props} />;
}

export default ShaderBackground;
