# React Native Easy Gestures (w/ Bug Fixes & Patch)

React Native Gestures. Support: Drag, Scale and Rotate a Component.

- [x] TypeScript support
- [x] Manually editable rotate and scale value
- [x] Rotate angle threshold added (Rotation steps added)
- [x] Now child component can detect onPress event detection
- [x] Ready for react 17.0.0

![example](https://raw.githubusercontent.com/keske/react-native-easy-gestures/master/static/gestures.gif)

## Instalation

### RN > 0.6 👶

```
$ npm install --save react-native-easy-gestures
```

### RN < 0.46 👴

```
$ npm install --save react-native-easy-gestures@1.0.x
```

## Usage

### <Warning>

> this project is not 100% fully patched yet, so here's some caution:
> you can't statically setting the values when you have rotate or scale value and remove it.
> make sure rotate and scale value exists if you're using these features. ('0deg' is ok.)
> or you can manually edit transform value in style attribute.

```js
import Gestures from 'react-native-easy-gestures';

/* Simple example: */
<Gestures>
  <Image
    source={photo}
    style={{
      width: 200,
      height: 300,
    }}
  />
</Gestures>

/* Only drag example witn `onChange` event: */
<Gestures
  rotatable={false}
  scalable={false}
  onChange={(event, styles) => {
    console.log(styles);
  }}
>
  <Image
    source={photo}
    style={{
      width: 200,
      height: 300,
    }}
  />
</Gestures>

/**
 * Another example:
 * Drag only on x axis;
 * Scale from 0.1 to 7;
 * Do not rotate;
 * On release callback;
 */
<Gestures
  draggable={{
    y: false,
  }}
  scalable={{
    min: 0.1,
    max: 7,
  }}
  rotatable={false}
  onEnd={(event, styles) => {
    console.log(styles);
  }}
>
  <Image
    source={photo}
    style={{
      width,
      height,
    }}
  />
</Gestures>

//Add scale and rotate props that allow statically setting the values
const [currentDeg, setCurrentDeg] = useState(180);
<Gestures
  rotate={`${currentDeg}deg`}
  scale={1}
>
  <Image
    source={photo}
    style={{
      width,
      height,
    }}
  />
</Gestures>
```

## Props

### Behavior

```javascript
draggable?: boolean = true | object = { x?: boolean = true, y?: boolean = true }
```

```javascript
rotatable?: boolean = true | object = { step?: number } (threshold angle)
```

```javascript
scalable?: boolean = true | object = { min?: number = 0.33, max?: number = 2 }
```

```javascript
rotate?: string (rotate value, after 'deg' is required. example: '120deg')
```

```javascript
scale?: number
```

### Styles

```javascript
style?: StyleProp<ViewStyle> (object) // which means, RN Styles.
```

### Callbacks

```javascript
onStart?(event: object, styles: object): void
```

```javascript
onChange?(event: object, styles: object): void
```

```javascript
onEnd?(event: object, styles: object): void
```

```javascript
onMultyTouchStart?(event: object, styles: object): void
```

```javascript
onMultyTouchChange?(event: object, styles: object): void
```

```javascript
onMultyTouchEnd?(event: object, styles: object): void
```

```javascript
onRotateStart?(event: object, styles: object): void
```

```javascript
onRotateChange?(event: object, styles: object): void
```

```javascript
onRotateEnd?(event: object, styles: object): void
```

```javascript
onScaleStart?(event: object, styles: object): void
```

```javascript
onScaleChange?(event: object, styles: object): void
```

```javascript
onScaleEnd?(event: object, styles: object): void
```

### How to reset styles

```javascript
<Gestures
  ref={(c) => { this.gestures = c; }}
  onEnd={(event, styles) => {
    this.gestures.reset((prevStyles) => {
      console.log(prevStyles);
    });
  }}
```

# Development

```
$ git clone https://github.com/keske/react-native-easy-gestures.git
$ cd react-native-easy-gestures
$ npm install
```

# TODO

- [x] Rotate step, ex: every 90deg
- [ ] Guidelines and center snap
