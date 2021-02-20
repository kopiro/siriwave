# SiriWave

The "Apple Siri" wave replicated in pure Javascript using the Canvas API. To learn more about the project, [read the blog post here](https://dev.to/kopiro/how-i-built-the-siriwavejs-library-a-look-at-the-math-and-the-code-l0o), [check the demo](http://kopiro.github.io/siriwave) or [codepen](https://codepen.io/kopiro/pen/oNYepEb).

[![npm version](https://badge.fury.io/js/siriwave.svg)](https://badge.fury.io/js/siriwave)

### iOS (classic) style

The classic, pre-iOS9 style.

<img src="etc/classic.gif" />

### iOS9 style

The new fluorescent wave introduced in iOS9.

<img src="etc/ios9.gif" />

### iOS13 style

_work in progress_

The wave reinvented as a bubble.

## Usage

### Browser (via CDN) usage

Import the UMD package via the unpkg CDN and it's ready to use.

```html
<script src="https://unpkg.com/siriwave/dist/siriwave.umd.min.js"></script>
```

### ES module

Install it through `npm install siriwave` or `yarn add siriwave` first:

```js
import SiriWave from "siriwave";
```

## Initialize

Create a div container and instantiate a new SiriWave object:

```html
<div id="siri-container"></div>
<script>
  var siriWave = new SiriWave({
    container: document.getElementById("siri-container"),
    width: 640,
    height: 200,
  });
</script>
```

## Constructor options

| Key               | Type               | Description                                                            | Default    | Required |
| ----------------- | ------------------ | ---------------------------------------------------------------------- | ---------- | -------- |
| `container`       | DOMElement         | The DOM container where the DOM canvas element will be added.          | null       | yes      |
| `style`           | "ios", "ios9"      | The style of the wave.                                                 | "ios"      | no       |
| `ratio`           | Number             | Ratio of the display to use. Calculated by default.                    | calculated | no       |
| `speed`           | Number             | The speed of the animation.                                            | 0.2        | no       |
| `amplitude`       | Number             | The amplitude of the complete wave-form.                               | 1          | no       |
| `frequency`       | Number             | The frequency of the complete wave-form. Only available in style "ios" | 6          | no       |
| `color`           | String             | Color of the wave. Only available in style "ios"                       | "#fff"     | no       |
| `cover`           | Bool               | The `canvas` covers the entire width or height of the container        | false      | no       |
| `autostart`       | Bool               | Decide wether start the animation on boot.                             | false      | no       |
| `pixelDepth`      | Number             | Number of step (in pixels) used when drawed on canvas.                 | 0.02       | no       |
| `lerpSpeed`       | Number             | Lerp speed to interpolate properties.                                  | 0.01       | no       |
| `curveDefinition` | ICurveDefinition[] | Override definition of the curves, check above for more details.       | null       | no       |

## API

#### `new SiriWave`

#### `curveDefinition`

By passing this argument, you're overriding the default curve definition resulting in a completely different style.

The default definition for the `ios` classic style is:

```js
[
  { attenuation: -2, lineWidth: 1, opacity: 0.1 },
  { attenuation: -6, lineWidth: 1, opacity: 0.2 },
  { attenuation: 4, lineWidth: 1, opacity: 0.4 },
  { attenuation: 2, lineWidth: 1, opacity: 0.6 },
  { attenuation: 1, lineWidth: 1.5, opacity: 1 },
];
```

and it results in 5 different sin-waves with different parameters and amplitude.

The `ios9` style definition is instead:

```js
[
  { color: "255,255,255", supportLine: true },
  { color: "15, 82, 169" }, // blue
  { color: "173, 57, 76" }, // red
  { color: "48, 220, 155" }, // green
];
```

and it results in 3 different colored waves + 1 support wave that needs to be there.

#### `start()`

Start the animation

#### `stop()`

Stop the animation.

#### `setSpeed(newValue)`

Set the new value of speed (animated)

#### `setAmplitude(value)`

Set the new value of amplitude (animated)

#### `dispose()`

Stop the animation and destroy the canvas, by removing it from the DOM.
Subsequent `start()` calls on this SiriWave instance will fail with an exception.

## Grapher plots

- [GCX default](etc/gcx/default.gcx)
- [GCX iOS 9](etc/gcx/ios9.gcx)

## Build and development

If you wanna make some modifications in your local environment, use:

````

yarn dev

```

this will create a watchable build with RollupJS and automatically create a server to see your changes in the browser.

To finally build all targets:

```

yarn build

```

## QA

#### How do I integrate this library with a microphone user input?

You can find an excellent demo [here](https://jsitor.com/PPQtOp9Yp) by @semmel
```
````
