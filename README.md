simplider 1.0

Ultralight, simple and customizable slider, responsive and retro-crossbrowsing.

Usage

HTML
	<div id='banner'></div>
	<script src='js/simplider.min.js'></script>
		
Javascript
	var jsonData = [{"IMAGE" : "img/image1.jpg", "LINK" : "http://..."},
	  		{"IMAGE" : "img/image2.jpg", "LINK" : "http://..."},
	   		{"IMAGE" : "img/image3.jpg", "LINK" : "http://..."},
	   		{"IMAGE" : "img/image4.jpg", "LINK" : "http://..."}];
		
	slideit("banner", jsonData, "fade", "100%", "45%", "", true, 6000, 1, true, "");


Customize

slideit( Container, JSONdata, Effect, Width, Height, ImagePath, Thumbs, Time, Velocity, Cover, Callback);

Container: Target container id.
JSONdata: JSON object notation with 2 values, the link to the IMAGE and the LINK onclick.
Effect: "fade", "slide".
Width: Image width into container.
Height: Use px for fixed height or % for keep it proportional to the width.
ImagePath: Additional path for images.
ThumbsS: true or false.
Time between transitions, milliseconds.
Velocity: Transition time multiplicator (1~5).
Cover: true or false.
Callback function.

- by Neoligero