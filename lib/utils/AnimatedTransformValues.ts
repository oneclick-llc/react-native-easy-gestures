import {
  Animated,
  type AnimatableNumericValue,
  type AnimatableStringValue,
} from 'react-native'

import type { GesturesTransformStyleSnapshot } from '../types'

interface AnimatableTransformStyle {
  /** order is crucial */
  transform: [
    { translateX: AnimatableNumericValue },
    { translateY: AnimatableNumericValue },
    { rotate: AnimatableStringValue },
    { scale: AnimatableNumericValue },
    // https://reactnative.dev/docs/animations#bear-in-mind
    { perspective: 1000 },
  ]
}

interface TransformValues {
  translateY: number
  translateX: number
  rotate: number
  scale: number
}

export class AnimatedTransformValues
  implements Record<keyof TransformValues, AnimatableNumericValue>
{
  /** public for Interface Implementation Check, should not be used directly */
  /* private */ readonly translateY = new Animated.Value(0)
  /** public for Interface Implementation Check, should not be used directly */
  /* private */ readonly translateX = new Animated.Value(0)
  /** public for Interface Implementation Check, should not be used directly */
  /* private */ readonly rotate = new Animated.Value(0)
  /** public for Interface Implementation Check, should not be used directly */
  /* private */ readonly scale = new Animated.Value(0)

  constructor(initialValues: TransformValues) {
    this.setValues(initialValues)
  }

  public setValues = (values: Partial<TransformValues>) => {
    for (const [key, value] of Object.entries(values))
      if (key in this && 'setValue' in this[key]) this[key].setValue(value)
  }

  public setValuesAnimated = (
    values: Partial<TransformValues>,
    {
      duration = 150,
      easing,
    }: {
      duration?: Animated.TimingAnimationConfig['duration']
      easing?: Animated.TimingAnimationConfig['easing']
    } = {},
  ) => {
    const animationsArray: Animated.CompositeAnimation[] = []

    for (const [key, value] of Object.entries(values)) {
      if (key in this) {
        animationsArray.push(
          Animated.timing(this[key], {
            toValue: value,
            useNativeDriver: true,
            duration,
            easing,
          }),
        )
      }
    }

    Animated.parallel(animationsArray).start(() => {
      // Animated is bugged – Value set with Animations couldn't be correctly retreived later
      this.setValues(values)
    })
  }

  public getTransformStyle = (): AnimatableTransformStyle => ({
    transform: [
      { translateX: this.translateX },
      { translateY: this.translateY },
      {
        rotate: this.rotate.interpolate({
          inputRange: [-36000, 36000],
          outputRange: [`${-36000}deg`, `${36000}deg`],
        }),
      },
      { scale: this.scale },
      { perspective: 1000 },
    ],
  })

  public getSnapshot = (): GesturesTransformStyleSnapshot => ({
    transform: [
      // @ts-ignore | __getValue exists
      { translateX: this.translateX.__getValue() },
      // @ts-ignore | __getValue exists
      { translateY: this.translateY.__getValue() },
      {
        rotate: this.rotate
          .interpolate({
            inputRange: [-36000, 36000],
            outputRange: [`${-36000}deg`, `${36000}deg`],
          })
          // @ts-ignore | __getValue exists
          .__getValue(),
      },
      // @ts-ignore | __getValue exists
      { scale: this.scale.__getValue() },
      { perspective: 1000 },
    ],
  })
}
