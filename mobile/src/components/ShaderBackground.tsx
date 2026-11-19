import React from "react";
import Aurora, { AuroraProps } from "./ui/aurora";

export interface ShaderBackgroundProps extends AuroraProps {
  className?: string;
}

export function ShaderBackground(props: ShaderBackgroundProps) {
  return <Aurora {...props} />;
}

export default ShaderBackground;
