// From https://github.com/kiddkai/react-native-gestures.git

import { NativeTouchEvent } from 'react-native'

export const pow2abs = (a: number, b: number) => Math.pow(Math.abs(a - b), 2)

export const distance = (touches: [NativeTouchEvent, NativeTouchEvent]) => {
  const firstTouch = touches[0]
  const secondTouch = touches[1]

  return Math.sqrt(
    pow2abs(firstTouch.pageX, secondTouch.pageX) +
      pow2abs(firstTouch.pageY, secondTouch.pageY),
  )
}

export const toDeg = (rad) => (rad * 180) / Math.PI

export const angle = (touches) => {
  const a = touches[0]
  const b = touches[1]

  if (touches.length < 2) return 0

  let deg = toDeg(Math.atan2(b.pageY - a.pageY, b.pageX - a.pageX))

  if (deg < 0) deg += 360

  return deg
}
