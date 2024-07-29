export interface GesturesTransformStyleSnapshot {
  /** order is crucial */
  transform: [
    { translateX: number },
    { translateY: number },
    { rotate: string },
    { scale: number },
    // https://reactnative.dev/docs/animations#bear-in-mind
    { perspective: 1000 },
  ]
}
