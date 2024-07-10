import React, { Component } from 'react'
import {
  AccessibilityProps,
  GestureResponderEvent,
  NativeTouchEvent,
  PanResponderCallbacks,
  PanResponderInstance,
  ViewProps,
  ViewStyle,
} from 'react-native'
import { PanResponder, View } from 'react-native'

import { distance } from './utils/math'
import { assertDoubleTouch, getScale, getTouches } from './utils/events'
import { RotationGestureHandler } from './gesturesHandlers/RotationGestureHandler'

interface TransformStyle {
  transform: [
    { translateX: number },
    { translateY: number },
    { rotate: string },
    { scale: number },
  ]
}
export type GesturesStyle = Omit<ViewStyle, 'transform'> & TransformStyle

export interface GesturesProps extends AccessibilityProps {
  children: React.ReactNode

  isEnabled?: boolean
  hitSlop?: ViewProps['hitSlop']
  draggable?: boolean

  rotatable?: boolean
  isRotationAnchoringEnabled?: boolean
  onRotationAnchor?(): void
  /**
   * @default 45
   * should be defined in {@linkcode Gestures.defaultProps}
   */
  rotationAnchorAngleDivider?: number

  minScale?: number
  maxScale?: number

  initialStyle?: Omit<GesturesStyle, 'transform'>

  initialTranslateX?: number
  initialTranslateY?: number
  initialRotate?: string
  initialScale?: number

  onStart?(event: GestureResponderEvent, style: GesturesStyle): void
  onMove?(event: GestureResponderEvent, styles: GesturesStyle): void
  onEnd?(event: GestureResponderEvent, style: GesturesStyle): void
}

interface GesturesState {}

export class Gestures extends Component<GesturesProps, GesturesState> {
  static defaultProps: GesturesProps = {
    children: undefined,

    isEnabled: true,
    hitSlop: { top: 20, right: 20, left: 20, bottom: 20 },
    draggable: true,

    rotatable: true,
    rotationAnchorAngleDivider: 45,

    minScale: 0.3,
    maxScale: 3,

    initialStyle: {},
    initialTranslateX: 0,
    initialTranslateY: 0,
    initialRotate: '0deg',
    initialScale: 0,
  }

  private _panResponder: PanResponderInstance

  // made public for child Classes
  /* private */ _touchesOnPanResponderGrant: NativeTouchEvent[] = []
  private _styleOnPanResponderGrant: GesturesStyle

  private _prevDistance: number

  // made public for child Classes
  /* private */ _transformStyle: TransformStyle['transform'] = [
    { translateX: 0 },
    { translateY: 0 },
    { rotate: '0deg' },
    { scale: 1 },
  ]

  // made public for child Classes
  /* private */ _wrapStyle: GesturesStyle

  private _rotationGestureHandler: RotationGestureHandler

  constructor(props: GesturesProps) {
    super(props)

    this._rotationGestureHandler = new RotationGestureHandler({
      parentComponent: this,
    })

    this._transformStyle = [
      { translateX: props.initialTranslateX ?? 0 },
      { translateY: props.initialTranslateY ?? 0 },
      { rotate: props.initialRotate ?? '0deg' },
      { scale: props.initialScale ?? 1 },
    ]
    this._wrapStyle = {
      ...this.props.initialStyle,
      transform: this._transformStyle,
    }

    this._panResponder = PanResponder.create({
      onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderEnd: this._handlePanResponderEnd,

      onPanResponderTerminate: () => true,
      onShouldBlockNativeResponder: () => true,
      onStartShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => true,
      onMoveShouldSetPanResponderCapture: (event, { dx, dy }) =>
        Math.abs(dx) > 1.5 || Math.abs(dy) > 1.5,
      onMoveShouldSetPanResponder: (event, { dx, dy }) =>
        Math.abs(dx) > 1.5 || Math.abs(dy) > 1.5,
    })
  }

  private _handleDragGesture: NonNullable<
    PanResponderCallbacks['onPanResponderMove']
  > = (_event, gestureState) => {
    const { _styleOnPanResponderGrant } = this
    const { draggable } = this.props

    const translateX = draggable
      ? _styleOnPanResponderGrant.transform[0].translateX + gestureState.dx
      : _styleOnPanResponderGrant.transform[0].translateX

    const translateY = draggable
      ? _styleOnPanResponderGrant.transform[1].translateY + gestureState.dy
      : _styleOnPanResponderGrant.transform[1].translateY

    this._transformStyle = [
      { translateX },
      { translateY },
      this._transformStyle[2],
      this._transformStyle[3],
    ]
  }

  private _handleScaleGesture: NonNullable<
    PanResponderCallbacks['onPanResponderMove']
  > = (event) => {
    const eventTouches = getTouches(event)
    const isEventDoubleTouch = assertDoubleTouch(eventTouches)
    if (!isEventDoubleTouch) return

    const { _touchesOnPanResponderGrant } = this
    const isPanResponderGrantedWithDoubleTouch = assertDoubleTouch(
      _touchesOnPanResponderGrant,
    )
    if (!isPanResponderGrantedWithDoubleTouch) return

    const { minScale, maxScale } = this.props

    if (
      minScale !== undefined &&
      maxScale !== undefined &&
      minScale !== 1 &&
      maxScale !== 1
    ) {
      const currentDistance = distance(eventTouches)
      const initialDistance = distance(_touchesOnPanResponderGrant)

      const increasedDistance = currentDistance - initialDistance
      const diffDistance = this._prevDistance - increasedDistance

      const scale = Math.min(
        Math.max(getScale(this._wrapStyle, diffDistance), minScale),
        maxScale,
      )

      this._transformStyle[3] = { scale }
      this._prevDistance = increasedDistance
    }
  }

  private _handlePanResponderGrant: PanResponderCallbacks['onPanResponderStart'] =
    (event) => {
      const { onStart } = this.props

      this._prevDistance = 0

      this._touchesOnPanResponderGrant = getTouches(event)
      this._styleOnPanResponderGrant = this._wrapStyle

      onStart?.(event, this._wrapStyle)
    }

  private _handlePanResponderMove: PanResponderCallbacks['onPanResponderMove'] =
    (event, gestureState) => {
      const touches = getTouches(event)

      if (touches.length !== this._touchesOnPanResponderGrant.length) {
        this._touchesOnPanResponderGrant = touches
      } else {
        this._handleDragGesture(event, gestureState)
        this._handlePinchGesture(event, gestureState)
      }

      this._setWrapStyleBasedOnTransformStyles()

      this.props.onMove?.(event, this._wrapStyle)
    }

  private _handlePanResponderEnd: PanResponderCallbacks['onPanResponderEnd'] = (
    event,
  ) => {
    this.props.onEnd?.(event, this._wrapStyle)

    this._setWrapStyleBasedOnTransformStyles()

    this._rotationGestureHandler.reset()
  }

  private _handlePinchGesture: NonNullable<
    PanResponderCallbacks['onPanResponderMove']
  > = (event, gestureState) => {
    if (event.nativeEvent.touches.length > 1) {
      this._handleScaleGesture(event, gestureState)
      this._rotationGestureHandler.handleRotationGestureEvent(
        event,
        gestureState,
      )
    }
  }

  private _wrapRef: View | null
  private _setWrapStyleBasedOnTransformStyles = () => {
    const style: GesturesStyle = {
      ...this._wrapStyle,
      transform: this._transformStyle,
    }

    this._wrapRef?.setNativeProps({ style })
    this._wrapStyle = style
  }

  componentWillUnmount() {
    this._rotationGestureHandler.reset()
  }

  render() {
    const { children, hitSlop, isEnabled } = this.props

    this._rotationGestureHandler.onParentRender(this.props)

    return (
      <View
        hitSlop={hitSlop}
        ref={(ref) => {
          this._wrapRef = ref
          ref?.setNativeProps({ style: this._wrapStyle })
        }}
        {...(isEnabled ? this._panResponder.panHandlers : {})}
        children={children}
      />
    )
  }
}
