import { GestureResponderEvent, NativeTouchEvent } from 'react-native'

import type { GesturesTransformStyleSnapshot } from '../types'

export const getTouches = (event: GestureResponderEvent) =>
  event.nativeEvent.touches

export const assertDoubleTouch = (
  touches: GestureResponderEvent['nativeEvent']['touches'],
): touches is [NativeTouchEvent, NativeTouchEvent] => touches.length > 1

/**
 * @returns Angle to be applied to {@linkcode transformStyle}
 */
export const getAngleToApply = ({
  transformStyle,
  previouslyAppliedEventAngle,
  eventAngle,
}: {
  transformStyle: GesturesTransformStyleSnapshot
  previouslyAppliedEventAngle: number
  /**
   * accountedToGestureStartEvent_EventAngle
   * rawEventAngle - gestureStartAngle
   */
  eventAngle: number
}) =>
  parseFloat(transformStyle.transform[2].rotate) -
  (previouslyAppliedEventAngle - eventAngle)

export const getScale = (
  style: GesturesTransformStyleSnapshot,
  diffDistance: number,
) => style.transform[3].scale - diffDistance / 400
