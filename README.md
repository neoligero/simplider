# Simplider 2.0

Ultralight, simple and customizable slider, responsive and retro-crossbrowsing: plain JavaScript with no dependencies, from Internet Explorer 6 to today's browsers.

Demo: https://neoligero.github.io/simplider/

## Usage

HTML

```html
<div id="banner"></div>
<script src="simplider.min.js"></script>
```

JavaScript

```js
var jsonData = [{"IMAGE" : "img/image1.jpg", "LINK" : "http://..."},
                {"IMAGE" : "img/image2.jpg", "LINK" : "http://..."},
                {"IMAGE" : "img/image3.jpg", "LINK" : "http://..."},
                {"IMAGE" : "img/image4.jpg", "LINK" : "http://..."}];

var slider = slideit("banner", jsonData, "fade", "100%", "45%", "", true, 6000, 1, true);
```

## Customize

```js
slideit(Container, JSONdata, Effect, Width, Height, ImagePath, Thumbs, Time, Velocity, Cover, Callback);
```

- **Container:** target container id.
- **JSONdata:** array of objects with the `IMAGE` to show and the `LINK` to open on click (leave it empty for no link).
- **Effect:** `"fade"` or `"slide"`.
- **Width:** slider width inside the container.
- **Height:** px for a fixed height, or % to keep it proportional to the width.
- **ImagePath:** additional path prepended to every image.
- **Thumbs:** `true` or `false`, shows the navigation dots.
- **Time:** time between transitions, in milliseconds.
- **Velocity:** transition speed multiplier (1~5).
- **Cover:** `true` fills the slider and crops the image, `false` shows it whole.
- **Callback:** function called on every transition, with the index of the next image.

`slideit` returns the slider, which you can drive yourself: `slider.next()`, `slider.prev()`, `slider.go(2)`, `slider.pause()` and `slider.play()`.

The slider pauses while the mouse is over it, and it also responds to swipes on touch screens and to the arrow keys when focused. Style it with the classes `simplider`, `simplider-stage`, `simplider-slide`, `simplider-thumbs` and `simplider-dot`.

## What's new in 2.0

- Transitions are timed, so they last the same in every browser and on every screen, and the Velocity option really changes them. They use `requestAnimationFrame` where it exists and a timer elsewhere.
- One timer at a time: clicking a dot never makes the slider jump twice or fall out of step.
- Fade works in Internet Explorer 6-8 (alpha filter), and images are fitted without `background-size`, so cover and contain also work there.
- Several sliders on the same page, with no global variables or fixed ids besides `slideit` and `Simplider`.
- Links work on every image from the start, an empty link no longer reloads the page, Thumbs can really be turned off, and resizing no longer replaces the page's own `onresize`.

The 1.0 call stays the same. Only the generated ids (`marco`, `container`, `b0`, `t0`...) became classes, so CSS written against those ids has to use the classes above.

- by Neoligero
