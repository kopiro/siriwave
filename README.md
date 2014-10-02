# SiriWaveJS

Have you ever thought on how to get the Siri wave effect on your website or mobile app? 

SiriWaveJS is a library that *easily* allows  you to get this effect.

**Embed the script... and Surf!**

![image](http://f.cl.ly/items/2q0I101D2t0p0W1Y0215/SWave.gif)

#### [See the live CodePen Example](http://cdpn.io/yfegd)

## Usage

```html
<div id="siri-container"></div>
<script src="/path/to/your/siriwave.js"></script>
<script>
var siriWave = new SiriWave({
	container: document.getElementById('siri-container'),
	width: 640,
	height: 200,
	speed: 0.5,
	noise: 0.5
});
```

## Constructor options

#### `canvas` (DOM Object, default: `document.body`)

The DOM container where the `canvas` to draw the wave is added.

#### `[speed]` (Number, from `0` to N, default: `0.1`)

The speed of the wave.

#### `[noise]` (Number, from `0` to `1`, default: `1`)

The noise (amplitude) of the wave.

#### `[color]` (String, Color, default: `#fff')

The color of the wave, in hexadecimal form (`#336699`, `#FF0`)

## API

#### `setNoise([ 0...1 ])`
Set the noise of the wave at runtime.

#### `setNoise([ 0...N ])`
Set the speed of the wave at runtime

#### `start()`
Start the animation

#### `stop()`
Stop the animation.

## Projects/examples that uses this script

* [The Capitol - The Official Government of Panem (Hunger Games Mockingjay Part 1 website)](http://www.thecapitol.pn/)
* [http://blog.kidliaa.com/demo/siri%20wave/](http://blog.kidliaa.com/demo/siri%20wave/ )

## Some math

![image](https://cloud.githubusercontent.com/assets/839700/3263201/224d98ec-f26f-11e3-971c-1e87f66a212f.JPG)
