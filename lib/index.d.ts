import React from "react";
import { AccessibilityProps, StyleProp, ViewStyle } from "react-native";

declare module "react-native-easy-gestures-new";

export interface GesturesProps extends AccessibilityProps {
  draggable?: boolean | { x?: boolean; y?: boolean };
  rotatable?: boolean | { step?: number };
  scalable?: boolean | { min?: number; max?: number };
  rotate?: string;
  scale?: number;

  style?: StyleProp<ViewStyle>;

  onStart?: (event: object, styles: object) => void;
  onChange?(event: object, styles: object): void;
  onEnd?(event: object, styles: object): void;
  onMultyTouchStart?(event: object, styles: object): void;
  onMultyTouchChange?(event: object, styles: object): void;
  onMultyTouchEnd?(event: object, styles: object): void;
  onRotateStart?(event: object, styles: object): void;
  onRotateChange?(event: object, styles: object): void;
  onRotateEnd?(event: object, styles: object): void;
  onScaleStart?(event: object, styles: object): void;
  onScaleChange?(event: object, styles: object): void;
  onScaleEnd?(event: object, styles: object): void;
}

interface GesturesStaticProperties {
  draggable?: true | { x?: boolean; y?: boolean };
  rotatable?: boolean;
  scalable?: boolean | { min?: number; max?: number };
  rotate?: string;
  scale?: number;
}

declare const Gestures: React.ComponentType<GesturesProps> &
  GesturesStaticProperties;
export default Gestures;
