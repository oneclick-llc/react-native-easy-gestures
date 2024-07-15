import type { PanResponderCallbacks } from 'react-native'

import type { Gestures } from '..'
import { getAngleToApply, getTouches } from '../utils/events'
import { getTouchesAngleInDeg, isAlmostEqual } from '../utils/math'

const ENABLE_LOGS = false
const localLog = ENABLE_LOGS ? console.log : undefined

/**
 * Exposes Method to handle continuous Gesture,
 * possibly requesting Rotation
 */
export class RotationGestureHandler {
  private static ANCHOR_EPSILON = 0.5
  private static REMAIN_ANCHORED_EPSILON = 5

  private _parentComponent: Gestures
  public onParentRender = (
    props: RotationGestureHandler['_parentComponent']['props'],
  ) => {
    localLog?.('onParentRender')

    this._setIsAngleAnchoringEnabled(!!props.isRotationAnchoringEnabled)
    this._anchorAngleDivider = props.rotationAnchorAngleDivider!
  }

  /**
   * defines Anchor Angles
   * eg: value is 90, then Anchor Angles will be [0, 90, 180, 270, 360, 450, ...]
   */
  private _anchorAngleDivider: number

  constructor({ parentComponent }: { parentComponent: Gestures }) {
    this._parentComponent = parentComponent
    this.onParentRender(parentComponent.props)
  }

  /**
   * is set in constructor via {@linkcode onParentRender}
   */
  private _isAngleAnchoringEnabled: boolean
  private _setIsAngleAnchoringEnabled = (value: boolean) => {
    localLog?.(`_setIsAngleAnchoringEnabled(${value})`)
    this._isAngleAnchoringEnabled = value
  }

  private _angleAnchoringEnableTimeoutId: NodeJS.Timeout | undefined
  private _temporarilyDisableAngleAnchoring = (timeMs: number = 1000) => {
    localLog?.(`_temporarilyDisableAngleAnchoring(timeMs: ${timeMs})`)

    this._setIsAngleAnchoringEnabled(false)

    if (this._angleAnchoringEnableTimeoutId)
      clearTimeout(this._angleAnchoringEnableTimeoutId)

    this._angleAnchoringEnableTimeoutId = setTimeout(() => {
      this._setIsAngleAnchoringEnabled(true)
    }, timeMs)
  }

  private _gestureStartEventAngle?: number
  private _setGestureStartEventAngle = (
    value: RotationGestureHandler['_gestureStartEventAngle'],
  ) => {
    localLog?.(`_setGestureStartEventAngle(${value})`)
    this._gestureStartEventAngle = value
  }

  /**
   * _currentContinuousGesturePreviouslyAppliedEventAngle
   */
  private _previouslyAppliedEventAngle = 0
  private _setPreviouslyAppliedEventAngle = (value: number) => {
    localLog?.(`_setPreviouslyAppliedEventAngle(${value})`)
    this._previouslyAppliedEventAngle = value
  }

  private _isAngleAnchored = false
  private _setIsAngleAnchored = (
    value: boolean,
    shouldDisableForMs?: number,
  ) => {
    localLog?.(
      `_setIsAngleAnchored(${value}, shouldDisableForMs: ${shouldDisableForMs})`,
    )
    this._isAngleAnchored = value

    if (shouldDisableForMs)
      this._temporarilyDisableAngleAnchoring(shouldDisableForMs)
  }
  private _appliedAnchorAngle?: number
  private _setAppliedAnchorAngle = (value: number | undefined) => {
    localLog?.(`_setAppliedAnchorAngle(${value})`)
    this._appliedAnchorAngle = value
  }

  private _anchorEventAngle?: number
  private _setAnchorEventAngle = (value: number | undefined) => {
    localLog?.(`_setAnchorEventAngle(${value})`)
    this._anchorEventAngle = value
  }

  private _deanchorEventAngle?: number
  private _setDeanchorEventAngle = (value: number | undefined) => {
    localLog?.(`_setDeanchorEventAngle(${value})`)
    this._deanchorEventAngle = value
  }

  public reset = (shouldResetAngleAnchoringEnableTimeoutId = false) => {
    localLog?.('reset')

    if (
      shouldResetAngleAnchoringEnableTimeoutId &&
      this._angleAnchoringEnableTimeoutId
    ) {
      clearTimeout(this._angleAnchoringEnableTimeoutId)
      this._setIsAngleAnchoringEnabled(true)
    }

    this._setGestureStartEventAngle(undefined)
    this._setPreviouslyAppliedEventAngle(0)
    this._setIsAngleAnchored(false)
    this._setAppliedAnchorAngle(undefined)
    this._setAnchorEventAngle(undefined)
    this._setDeanchorEventAngle(undefined)
  }

  public handleRotationGestureEvent: NonNullable<
    PanResponderCallbacks['onPanResponderMove']
  > = (event) => {
    const { rotatable } = this._parentComponent.props
    if (!rotatable) return

    const { _touchesOnPanResponderGrant } = this._parentComponent

    const _rawEventAngle = getTouchesAngleInDeg(getTouches(event))

    if (
      this._gestureStartEventAngle === undefined &&
      _touchesOnPanResponderGrant.length > 1
    ) {
      this._setGestureStartEventAngle(
        getTouchesAngleInDeg(_touchesOnPanResponderGrant),
      )
    }

    const _gestureStartAngle = this._gestureStartEventAngle ?? _rawEventAngle
    const eventAngle = _rawEventAngle - _gestureStartAngle

    let angleToApply = getAngleToApply({
      gesturesStyle: this._parentComponent._wrapStyle,
      previouslyAppliedEventAngle: this._previouslyAppliedEventAngle,
      eventAngle,
    })

    localLog?.({
      angleToApply,
      _previouslyAppliedEventAngle: this._previouslyAppliedEventAngle,
      'this._parentComponent._wrapStyle.transform[2].rotate':
        this._parentComponent._wrapStyle.transform[2].rotate,
    })

    const angularDistanceToAnchorAngle = Math.abs(
      angleToApply % this._anchorAngleDivider,
    )

    if (this._isAngleAnchored) {
      const shouldRemainAnchored = isAlmostEqual(
        this._appliedAnchorAngle ?? 0,
        angleToApply,
        RotationGestureHandler.REMAIN_ANCHORED_EPSILON,
      )
      localLog?.({
        _appliedAnchorAngle: this._appliedAnchorAngle,
        angleToApply,
        shouldRemainAnchored,
      })
      if (shouldRemainAnchored) return

      this._setIsAngleAnchored(false, 500)
      this._setDeanchorEventAngle(eventAngle)
    } else if (this._isAngleAnchoringEnabled) {
      const shouldAnchor =
        angularDistanceToAnchorAngle < RotationGestureHandler.ANCHOR_EPSILON ||
        angularDistanceToAnchorAngle >
          this._anchorAngleDivider - RotationGestureHandler.ANCHOR_EPSILON

      localLog?.({
        angleToApply,
        shouldAnchor,
        angularDistanceToAnchorAngle,
      })

      if (shouldAnchor) {
        this._parentComponent.props.onRotationAnchor?.()

        this._setIsAngleAnchored(true)
        this._setAnchorEventAngle(eventAngle)
        this._setDeanchorEventAngle(undefined)

        angleToApply =
          Math.round(angleToApply / this._anchorAngleDivider) *
          this._anchorAngleDivider
        this._setAppliedAnchorAngle(angleToApply)
      }
    }

    if (
      !this._isAngleAnchored &&
      this._anchorEventAngle !== undefined &&
      this._deanchorEventAngle !== undefined
    ) {
      angleToApply = getAngleToApply({
        gesturesStyle: this._parentComponent._wrapStyle,
        previouslyAppliedEventAngle: this._previouslyAppliedEventAngle,
        eventAngle:
          eventAngle - (this._deanchorEventAngle - this._anchorEventAngle),
      })
      this._setAnchorEventAngle(undefined)
      this._setDeanchorEventAngle(undefined)
    }

    this._parentComponent._transformStyle[2] = { rotate: `${angleToApply}deg` }

    this._setPreviouslyAppliedEventAngle(eventAngle)
  }
}
