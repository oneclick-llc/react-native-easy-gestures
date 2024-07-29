import React, { Component } from 'react'
import {
  AccessibilityProps,
  PanResponder,
  Animated,
  GestureResponderEvent,
  NativeTouchEvent,
  PanResponderCallbacks,
  PanResponderInstance,
  ViewProps,
  ViewStyle,
} from 'react-native'

import { distance } from './utils/math'
import { assertDoubleTouch, getScale, getTouches } from './utils/events'
import { RotationGestureHandler } from './gesturesHandlers/RotationGestureHandler'
import { AnimatedTransformValues } from './utils/AnimatedTransformValues'
import type { GesturesTransformStyleSnapshot } from './types'

export type GesturesStyle = Omit<ViewStyle, 'transform'>

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

  style?: GesturesStyle

  initialTranslateX?: number
  initialTranslateY?: number
  initialRotate?: string
  initialScale?: number

  onStart?(
    event: GestureResponderEvent,
    style: GesturesTransformStyleSnapshot,
  ): void
  onMove?(
    event: GestureResponderEvent,
    styles: GesturesTransformStyleSnapshot,
  ): void
  onEnd?(
    event: GestureResponderEvent,
    style: GesturesTransformStyleSnapshot,
  ): void
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

    style: {},
    initialTranslateX: 0,
    initialTranslateY: 0,
    initialRotate: '0deg',
    initialScale: 0,
  }

  private _panResponder: PanResponderInstance

  // made public for child Classes
  /* private */ _touchesOnPanResponderGrant: NativeTouchEvent[] = []

  private _transformStyleOnPanResponderGrant: GesturesTransformStyleSnapshot

  private _prevDistance: number

  public animatedTransformValues: AnimatedTransformValues

  private _rotationGestureHandler: RotationGestureHandler

  constructor(props: GesturesProps) {
    super(props)

    this._rotationGestureHandler = new RotationGestureHandler({
      parentComponent: this,
    })

    this.animatedTransformValues = new AnimatedTransformValues({
      translateX: props.initialTranslateX ?? 0,
      translateY: props.initialTranslateY ?? 0,
      rotate: parseFloat(props.initialRotate ?? '0deg'),
      scale: props.initialScale ?? 1,
    })

    this._panResponder = PanResponder.create({
      onPanResponderGrant: this._handlePanResponderGrant,
      onPanResponderMove: this._handlePanResponderMove,
      onPanResponderEnd: this._handlePanResponderEnd,

      // onStartShouldSetPanResponderCapture: () => true,

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
    const { _transformStyleOnPanResponderGrant } = this
    const { draggable } = this.props

    const translateX = draggable
      ? _transformStyleOnPanResponderGrant.transform[0].translateX +
        gestureState.dx
      : _transformStyleOnPanResponderGrant.transform[0].translateX

    const translateY = draggable
      ? _transformStyleOnPanResponderGrant.transform[1].translateY +
        gestureState.dy
      : _transformStyleOnPanResponderGrant.transform[1].translateY

    this.animatedTransformValues.setValues({ translateX, translateY })
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
        Math.max(
          getScale(this.animatedTransformValues.getSnapshot(), diffDistance),
          minScale,
        ),
        maxScale,
      )

      this.animatedTransformValues.setValues({ scale })
      this._prevDistance = increasedDistance
    }
  }

  private _handlePanResponderGrant: PanResponderCallbacks['onPanResponderGrant'] =
    (event) => {
      this._touchesOnPanResponderGrant = getTouches(event)
      this._transformStyleOnPanResponderGrant =
        this.animatedTransformValues.getSnapshot()

      this._prevDistance = 0

      this.props.onStart?.(event, this.animatedTransformValues.getSnapshot())
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

      this.props.onMove?.(event, this.animatedTransformValues.getSnapshot())
    }

  private _handlePanResponderEnd: PanResponderCallbacks['onPanResponderEnd'] = (
    event,
  ) => {
    if (!event.nativeEvent.touches.length)
      this.props.onEnd?.(event, this.animatedTransformValues.getSnapshot())

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

  componentWillUnmount() {
    this._rotationGestureHandler.reset()
  }

  render() {
    const { children, hitSlop, isEnabled } = this.props

    this._rotationGestureHandler.onParentRender(this.props)

    return (
      <Animated.View
        hitSlop={hitSlop}
        {...(isEnabled ? this._panResponder.panHandlers : {})}
        style={[
          this.props.style,
          this.animatedTransformValues.getTransformStyle(),
        ]}
        children={children}
      />
    )
  }
}
