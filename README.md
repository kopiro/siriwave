Have you ever thought on how to get the Siri wave effect on your website or mobile app? SiriWaveJS is a library that *easily* allows  you to get this effect.

**Embed the script... and Surf!**

![image](http://f.cl.ly/items/2q0I101D2t0p0W1Y0215/SWave.gif)

### [Live CodePen Example](http://cdpn.io/yfegd)


### Add the canvas to a container

```javascript
var s = new SiriWave({
	container: document.getElementById('your-div'),
	width: 640,
	height: 200
});
```

### Set the noise

```javascript
s.setNoise([ 0...1 ])
```

### Set the speed

```javascript
s.setSpeed(0.4);
```

### Start the animation

```javascript
s.start();
```

### Stop the animation

```javascript
s.stop();
```
