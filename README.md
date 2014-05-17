# SiriWave

![image](http://f.cl.ly/items/2H213h0s0k302X333n44/Screen%20Shot%202014-05-16%20at%2023.49.55.PNG)

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