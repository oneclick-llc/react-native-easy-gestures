import { GestureResponderEvent, NativeTouchEvent } from 'react-native'

import { GesturesStyle } from '..'

export const getTouches = (event: GestureResponderEvent) =>
  event.nativeEvent.touches

export const assertDoubleTouch = (
  touches: GestureResponderEvent['nativeEvent']['touches'],
): touches is [NativeTouchEvent, NativeTouchEvent] => touches.length > 1

/**
 * @returns Angle to be applied to {@linkcode gesturesStyle}
 */
export const getAngleToApply = ({
  gesturesStyle,
  previouslyAppliedEventAngle,
  eventAngle,
}: {
  gesturesStyle: GesturesStyle
  previouslyAppliedEventAngle: number
  /**
   * accountedToGestureStartEvent_EventAngle
   * rawEventAngle - gestureStartAngle
   */
  eventAngle: number
}) =>
  parseFloat(gesturesStyle.transform[2].rotate) -
  (previouslyAppliedEventAngle - eventAngle)

export const getScale = (style: GesturesStyle, diffDistance: number) =>
  style.transform[3].scale - diffDistance / 400
