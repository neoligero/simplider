/*
	SIMPLIDER 1.0
	AUTHOR: Neoligero
*/

var banners = new Array();
var z = 1000;
var actual = 0;
var moving = false;
var effect = '';
var b_width = '';
var b_height = '';
var pixel_height = '';
var aditionalPath = '';
var showThumbs = true;
var id_container = '';
var showTime = 5000;
var transitionTime = 1;
var cover = false;
var recursive;
var callbackFunc;


function slideit( id, jsondata, fx, w, h, addPath, thumbs, time, transitionVelocity, cover, callback ){
	window.banners = toArray(jsondata);
	window.effect = fx || "slide";
	window.b_width = w || "100%";
	window.b_height = h || "50%";
	window.aditionalPath = addPath || "";
	window.showThumbs = thumbs || true;
	window.id_container = id;
	window.showTime = time || 5000;
	window.transitionTime = transitionVelocity || 1;
	window.cover = cover || false;
	if(typeof callback == 'function')
		window.callbackFunc = callback;
	else{
		window.callbackFunc = function(){};
	}

	var mainContainer = document.getElementById(id_container);
	window.b_height = String(window.b_height);
	if(window.b_height.indexOf('%') > 0) {
		var percent = window.b_height.substr(0, window.b_height.indexOf('%'))
		window.pixel_height = ( (mainContainer.offsetWidth * parseFloat(percent)) / 100 ) + "px";
		mainContainer.style.height = window.pixel_height;
		window.onresize = resize;
	}
	else{
		window.pixel_height = h;
		mainContainer.style.height = window.pixel_height;
	}

	initialize();
	setTimeout( function () { run(1); }, showTime);
}


function initialize () {
	var mainContainer = document.getElementById(id_container);

	var marco = document.createElement("div");
	marco.id = 'marco';
	marco.style.position = 'relative';
	marco.style.width = window.b_width;
	marco.style.height = "100%";
	marco.style.margin = '0 auto';
	
	var container = document.createElement("div");
	container.id = 'container';
	container.style.position = 'relative';
	container.style.overflow = 'hidden';
	container.style.width = window.b_width;
	container.style.height = '100%';
	
	var b = document.createElement('div');
	b.id = 'b0';
	b.style.position = 'absolute';
	b.style.left = '0px';
	b.style.zIndex = z;
	b.style.width = window.b_width;
	b.style.height = "100%";
	b.style.background = 'url(' + aditionalPath + banners[0]['IMAGE'] + ')';
	if(window.cover)
		b.style.backgroundSize = 'cover';
	else
		b.style.backgroundSize = 'contain';
	b.style.backgroundPosition = 'center';
	b.style.backgroundRepeat = 'no-repeat';
	b.style.margin = '0 auto';
	if( banners[0]['URL'].length > 0 )
		b.style.cursor = 'pointer';
	b.onclick = function(){ window.location.href =  banners[0]['URL']; };
	container.appendChild(b);
	
	for( var i = 1; i < banners.length; i++ ) {
		var b = document.createElement('div');
		b.id = 'b' + i;
		b.style.position = 'absolute';
		b.style.width = window.b_width;
		b.style.height = '100%';
		b.style.background = 'url(' + aditionalPath + banners[i]['IMAGE'] + ')';
		if(window.cover)
			b.style.backgroundSize = 'cover';
		else
			b.style.backgroundSize = 'contain';
		b.style.backgroundPosition = 'center';
		b.style.backgroundRepeat = 'no-repeat';
		if(window.effect == "slide")
			b.style.left = window.b_width;
		else{
			b.style.left = "0px";
			b.style.opacity = "0.0";
		}
		b.style.margin = '0 auto';
		if( banners[0]['URL'].length > 0 )
			b.style.cursor = 'pointer';
		b.onclick = function(){ window.location.href =  banners[i]['URL']; };
		container.appendChild(b);
	}
	
	if(showThumbs) {
		var thumbs = document.createElement("div");
		thumbs.id = 'thumbs';
		thumbs.className = 'thumbs';
		thumbs.style.position = 'relative';
		thumbs.style.width = window.b_width;
		thumbs.style.height = '40px';
		for( var i = banners.length - 1; i >= 0 ; i-- ) {
			var t = document.createElement("div");
			t.id = 't' + i;
			t.style.position = 'relative';
			t.style.width = '20px';
			t.style.height = '20px';
			t.style.borderRadius = '10px';
			t.style.float = 'right';
			if( i == 0 )
				t.style.background = '#000000';
			else
				t.style.background = '#cccccc';
			t.style.margin = '3px';
			t.style.cursor = 'pointer';
			
			t.onclick = (function() {
				var currentI = i;
				return function() { 
					run(currentI);
				}
			})();
			
			thumbs.appendChild(t);
		}
	}
	marco.appendChild(container);
	if(showThumbs)
		marco.appendChild(thumbs);
	mainContainer.appendChild(marco);
}


function run(next) {
	if(next != actual && !moving) {
		moving = true;
		if( next == banners.length )
			next = 0;
		
		z++;
		document.getElementById("b" + next).style.zIndex = z;

		window.callbackFunc();

		if(window.effect == "slide"){
			animateLeft(document.getElementById("b" + next),
				function() {
					document.getElementById("b" + next).onclick = function(){ window.location.href =  banners[next]['URL']; };
					document.getElementById("b" + actual).style.left = window.b_width;

					if(showThumbs){
						document.getElementById("t" + next).style.background = '#000000';
						document.getElementById("t" + actual).style.background = '#cccccc';
					}
					
					clearTimeout(recursive);
					recursive = setTimeout( function () { run(next + 1); }, showTime);
					moving = false;
					actual = next;
				}
			);
		}
		else if(window.effect == "fade"){
			animateFade(document.getElementById("b" + next),
				function() {
					document.getElementById("b" + next).onclick = function(){ window.location.href =  banners[next]['URL']; };
					document.getElementById("b" + actual).style.opacity = 0.0;
					
					if(showThumbs){
						document.getElementById("t" + next).style.background = '#000000';
						document.getElementById("t" + actual).style.background = '#cccccc';
					}

					clearTimeout(recursive);
					recursive = setTimeout( function () { run(next + 1); }, showTime);
					moving = false;
					actual = next;
				}
			);
		}
	}
}


function animateFade(obj, callback){
	var opac = 0.0;
	(function loop(obj, callback){
		if(opac >= 1.0){
			callback();
		}
		else{
			opac = opac + 0.01;
			obj.style.opacity = opac;
			setTimeout(function(){
				loop(obj, callback);
			}, 5 / window.transitionTime);
		}
	})(obj, callback);
}


function animateLeft( obj, callback){
	var pos = obj.offsetWidth;
	(function loop(obj, callback){
		if(pos <= 0){
			callback();
		}
		else{
			pos = pos - 5;
			obj.style.left = pos + "px";
			setTimeout(function(){
				loop(obj, callback);
			}, 5 / window.transitionTime);
		}
	})(obj, callback);
}


function toArray(obj){
	var array_banner = new Array();
	var temp = new Array();
	var index = 0;
	for(var i in obj) {
		temp[index] = new Array();
		temp[index]['IMAGE'] = obj[i].IMAGE;
		temp[index]['URL'] = obj[i].LINK;
		index++;
	}
	return temp;
}


function resize(){
	var mainContainer = document.getElementById(id_container);
	var percent = window.b_height.substr(0, window.b_height.indexOf('%'))
	window.pixel_height = ( (mainContainer.offsetWidth * parseFloat(percent)) / 100 ) + "px";
	mainContainer.style.height = window.pixel_height
}