/*
	SIMPLIDER 2.0
	AUTHOR: Neoligero

	Plain JavaScript (ES3, no dependencies): runs from Internet Explorer 6 to today's browsers.
	Usage stays the same as 1.0:
	slideit(container, data, effect, width, height, imagePath, thumbs, time, velocity, cover, callback)
	It now returns the slider, with next(), prev(), go(index), pause() and play().
*/

(function (window, document) {

	var probe = document.createElement('div').style;
	var hasOpacity = probe.opacity !== undefined; // IE6-8 only know their own alpha filter
	var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || null;

	function now() { return new Date().getTime(); }

	// smooth frames where the browser offers them, a 60 fps timer everywhere else
	function nextFrame(fn) {
		if (raf) raf.call(window, fn);
		else window.setTimeout(fn, 16);
	}

	function on(el, type, fn) {
		if (el.addEventListener) el.addEventListener(type, fn, false);
		else if (el.attachEvent) el.attachEvent('on' + type, fn);
	}

	function setOpacity(el, value) {
		if (hasOpacity) el.style.opacity = value;
		else el.style.filter = value >= 1 ? '' : 'alpha(opacity=' + Math.round(value * 100) + ')';
	}

	function ease(p) { return p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; }

	function create(tag, className, css) {
		var el = document.createElement(tag);
		el.className = className;
		for (var key in css) {
			if (css.hasOwnProperty(key)) el.style[key] = css[key];
		}
		return el;
	}


	function Slider(id, jsondata, fx, w, h, addPath, thumbs, time, transitionVelocity, cover, callback) {
		var self = this;
		this.root = document.getElementById(id);
		this.effect = fx === 'fade' ? 'fade' : 'slide';
		this.width = w || '100%';
		this.height = String(h || '50%');
		this.path = addPath || '';
		this.showThumbs = thumbs !== false;
		this.time = Number(time) || 5000;
		this.duration = 1200 / Math.min(5, Math.max(1, Number(transitionVelocity) || 1));
		this.cover = cover === true;
		this.callback = typeof callback === 'function' ? callback : function () {};
		this.items = [];
		this.actual = 0;
		this.moving = false;
		this.pending = null;
		this.paused = false;
		this.timer = null;

		for (var i = 0; i < jsondata.length; i++) {
			this.items.push({ image: this.path + jsondata[i].IMAGE, link: jsondata[i].LINK || '' });
		}
		if (!this.root || this.items.length === 0) return;

		this.build();
		this.resize();
		on(window, 'resize', function () { self.resize(); });
		this.schedule();
	}

	Slider.prototype.build = function () {
		this.frame = create('div', 'simplider', { position: 'relative', width: this.width, margin: '0 auto' });
		this.stage = create('div', 'simplider-stage', { position: 'relative', overflow: 'hidden', width: '100%' });
		this.stage.tabIndex = 0;
		this.slides = [];

		for (var i = 0; i < this.items.length; i++) {
			var slide = create('div', 'simplider-slide', {
				position: 'absolute', left: '0px', top: '0px', overflow: 'hidden', zoom: 1,
				display: i === 0 ? 'block' : 'none', cursor: this.items[i].link ? 'pointer' : 'default'
			});
			var img = create('img', 'simplider-img', { position: 'absolute', border: '0', maxWidth: 'none' });
			img.alt = '';
			slide.appendChild(img);
			this.stage.appendChild(slide);
			this.slides.push({ el: slide, img: img, w: 0, h: 0 });
			this.load(i);
			slide.onclick = this.opener(i);
		}
		this.frame.appendChild(this.stage);

		if (this.showThumbs) {
			this.dots = [];
			var row = create('div', 'simplider-thumbs', { position: 'relative', height: '40px' });
			// floated right, so the first image ends up on the left
			for (var j = this.items.length - 1; j >= 0; j--) {
				var dot = create('div', 'simplider-dot', {
					position: 'relative', width: '20px', height: '20px', borderRadius: '10px', overflow: 'hidden',
					cssFloat: 'right', styleFloat: 'right', margin: '3px', cursor: 'pointer',
					background: j === 0 ? '#000000' : '#cccccc'
				});
				dot.onclick = this.jumper(j);
				row.appendChild(dot);
				this.dots[j] = dot;
			}
			this.frame.appendChild(row);
		}
		this.root.appendChild(this.frame);
		this.listen();
	};

	// the real size of each image, measured apart so cached images also report it
	Slider.prototype.load = function (i) {
		var self = this, slide = this.slides[i], measure = new Image();
		measure.onload = function () {
			slide.w = measure.width;
			slide.h = measure.height;
			self.fit(slide);
		};
		measure.src = this.items[i].image;
		slide.img.src = this.items[i].image;
	};

	Slider.prototype.opener = function (i) {
		var self = this;
		return function () {
			if (self.swiped) { self.swiped = false; return; }
			if (self.items[i].link) window.location.href = self.items[i].link;
		};
	};

	Slider.prototype.jumper = function (i) {
		var self = this;
		return function () { self.go(i); };
	};

	Slider.prototype.listen = function () {
		var self = this, stage = this.stage, startX = null;
		var enter = 'onmouseenter' in stage ? 'mouseenter' : 'mouseover';
		var leave = 'onmouseleave' in stage ? 'mouseleave' : 'mouseout';
		on(stage, enter, function () { self.paused = true; self.stop(); });
		on(stage, leave, function () { self.paused = false; self.schedule(); });
		on(stage, 'keydown', function (e) {
			e = e || window.event;
			if (e.keyCode === 37) self.prev();
			if (e.keyCode === 39) self.next();
		});
		if (stage.addEventListener) {
			stage.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; self.swiped = false; }, false);
			stage.addEventListener('touchend', function (e) {
				if (startX === null) return;
				var dx = e.changedTouches[0].clientX - startX;
				startX = null;
				if (Math.abs(dx) < 40) return;
				self.swiped = true;
				if (dx < 0) self.next(); else self.prev();
			}, false);
		}
	};

	Slider.prototype.resize = function () {
		var width = this.stage.offsetWidth;
		var height = this.height.indexOf('%') > 0 ? Math.round(width * parseFloat(this.height) / 100) : parseInt(this.height, 10);
		this.stage.style.height = height + 'px';
		this.w = width;
		this.h = height;
		for (var i = 0; i < this.slides.length; i++) {
			this.slides[i].el.style.width = width + 'px';
			this.slides[i].el.style.height = height + 'px';
			this.fit(this.slides[i]);
		}
	};

	// "cover" fills the slider and crops, otherwise the whole image shows ("contain")
	Slider.prototype.fit = function (slide) {
		if (!slide.w || !this.w) return;
		var scale = this.cover ? Math.max(this.w / slide.w, this.h / slide.h) : Math.min(this.w / slide.w, this.h / slide.h);
		var w = Math.round(slide.w * scale), h = Math.round(slide.h * scale);
		slide.img.style.width = w + 'px';
		slide.img.style.height = h + 'px';
		slide.img.style.left = Math.round((this.w - w) / 2) + 'px';
		slide.img.style.top = Math.round((this.h - h) / 2) + 'px';
	};

	Slider.prototype.stop = function () {
		if (this.timer) window.clearTimeout(this.timer);
		this.timer = null;
	};

	// only one timer at a time: every change resets it, so nothing jumps twice
	Slider.prototype.schedule = function () {
		var self = this;
		this.stop();
		if (this.paused || this.items.length < 2) return;
		this.timer = window.setTimeout(function () { self.next(); }, this.time);
	};

	Slider.prototype.next = function () { this.go((this.actual + 1) % this.items.length, 1); };
	Slider.prototype.prev = function () { this.go((this.actual - 1 + this.items.length) % this.items.length, -1); };
	Slider.prototype.pause = function () { this.paused = true; this.stop(); };
	Slider.prototype.play = function () { this.paused = false; this.schedule(); };

	Slider.prototype.go = function (next, dir) {
		var self = this;
		if (next === this.actual || next < 0 || next >= this.items.length) return;
		if (this.moving) { this.pending = next; return; } // runs as soon as this transition ends
		this.stop();
		this.moving = true;
		dir = dir || (next > this.actual ? 1 : -1);

		var from = this.slides[this.actual].el, to = this.slides[next].el, w = this.w;
		var start = now(), duration = this.duration, fade = this.effect === 'fade';
		from.style.zIndex = 1;
		to.style.zIndex = 2;
		if (fade) { to.style.left = '0px'; setOpacity(to, 0); }
		else { to.style.left = dir * w + 'px'; }
		to.style.display = 'block';
		this.callback(next);

		(function step() {
			var p = Math.min(1, (now() - start) / duration), e = ease(p);
			if (fade) setOpacity(to, e);
			else {
				to.style.left = Math.round(dir * w * (1 - e)) + 'px';
				from.style.left = Math.round(-dir * w * e) + 'px';
			}
			if (p < 1) return nextFrame(step);

			from.style.display = 'none';
			from.style.left = '0px';
			to.style.left = '0px';
			setOpacity(to, 1);
			if (self.dots) {
				self.dots[self.actual].style.background = '#cccccc';
				self.dots[next].style.background = '#000000';
			}
			self.actual = next;
			self.moving = false;
			if (self.pending !== null) {
				var queued = self.pending;
				self.pending = null;
				self.go(queued);
			}
			else self.schedule();
		})();
	};


	window.Simplider = Slider;
	window.slideit = function (id, jsondata, fx, w, h, addPath, thumbs, time, transitionVelocity, cover, callback) {
		return new Slider(id, jsondata, fx, w, h, addPath, thumbs, time, transitionVelocity, cover, callback);
	};

})(window, document);
