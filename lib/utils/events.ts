import { GestureResponderEvent, NativeTouchEvent } from 'react-native'

import { GesturesStyle } from '..'

export const getTouches = (event: GestureResponderEvent) =>
  event.nativeEvent.touches

export const assertDoubleTouch = (
  touches: GestureResponderEvent['nativeEvent']['touches'],
): touches is [NativeTouchEvent, NativeTouchEvent] => touches.length > 1

/**
 * Diff between current angle and initial angle
 */
export const getAngle = (styles: GesturesStyle, diffAngle: number) =>
  `${parseFloat(styles.transform[2].rotate) - diffAngle}deg`

export const getScale = (style: GesturesStyle, diffDistance: number) =>
  style.transform[3].scale - diffDistance / 400
