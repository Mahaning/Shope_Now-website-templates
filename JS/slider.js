(function() {

	'use strict';

	/* global TweenMax, Power1 */


	//DOM
	var canvas0 = document.getElementById('canvas0'),
		ctx0 = canvas0.getContext('2d'),
		canvas1 = document.getElementById('canvas1'),
		ctx1 = canvas1.getContext('2d'),
		canvas2 = document.getElementById('canvas2'),
		ctx2 = canvas2.getContext('2d'),
		canvas3 = document.getElementById('canvas3'),
		ctx3 = canvas3.getContext('2d'),
		linklist = document.querySelector('.link-list'),
		btns = document.querySelector('.btns'),
		nextBtn = btns.querySelector('.show-next'),
		loadTxt = document.querySelector('.loading-txt');;


	// CONST
	var VW, VH, AR;
	var IS_ACTIVE = 'is-active';


	// VARS
	var isAnimating = false,
		currentImage = 0,
		prevImage = 0,
		currentLink,
		imagesloaded = 0,
		partMove = {
			val: 1
		};
	var slideshowInterval;


	// IMAGES STUFF
	var imagesList = [],
		linkList = [];
	var imgW, imgH, IAR;


	// CANVAS STUFF
	var partList = [{
		context: ctx1,
		xpos: 100,
		radius: 0 // circumference of mask1
	}, {
		context: ctx2,
		xpos: -70,
		radius: 0 // circumference of mask2
	}, {
		context: ctx3,
		xpos: 50,
		radius: 0 // circumference of mask3
	}];








	function drawImages() {

		var imgPrev = imagesList[prevImage];
		var imgNext = imagesList[currentImage];

		// This is Next
		ctx0.globalAlpha = 1;
		ctx0.drawImage(imgNext, 0, 0, imgW, imgH);

		// This is Prev
		ctx0.globalAlpha = partMove.val;
		ctx0.drawImage(imgPrev, 0, 0, imgW, imgH);



		var obj, ctx, xPrev, xNext;
		for (var i = 0; i < partList.length; i++) {

			obj = partList[i];
			ctx = obj.context;
			xPrev = -obj.xpos * (1 - partMove.val);
			xNext = obj.xpos * partMove.val;

			ctx.clearRect(0, 0, VW, VH);

			ctx.save();
			ctx.beginPath();
			ctx.arc(VW / 2, VH / 2, obj.radius, 0, 2 * Math.PI, false);
			ctx.fill();

			// This is Next
			ctx.globalAlpha = 1;
			ctx.globalCompositeOperation = 'source-in';
			ctx.drawImage(imgNext, xNext, 0, imgW, imgH);

			// This is Prev
			ctx.globalAlpha = partMove.val;
			ctx.globalCompositeOperation = 'source-atop';
			ctx.drawImage(imgPrev, xPrev, 0, imgW, imgH);


			ctx.globalCompositeOperation = 'source-over';
			ctx.globalAlpha = 1;

			if (i === 0) {
// 				if (i !== partList.length-1) {
				ctx.lineWidth = 1;
				ctx.strokeStyle = '#fff';
				ctx.stroke();
			}

			// ctx.restore();

		}
	}

	function changeImage() {

		// Do not interupt previous movement
		if (isAnimating) {
			return;
		}

		isAnimating = true;

		TweenMax.to(partMove, 1, {
			val: 0,
			ease: Power1.easeInOut,
			onUpdate: drawImages,
			onComplete: function() {
				partMove.val = 1;
				isAnimating = false;
			}
		});

	}



	function onBtnsClick(e) {

		e.preventDefault();
		// Do not interupt previous animation
		if (isAnimating) {
			return;
		}

		var trgt = e.target;
		if (trgt.nodeName === 'BUTTON') {

			prevImage = currentImage;

			if (trgt.classList.contains('show-next')) {
				(currentImage + 1 >= imagesList.length) ? currentImage = 0: currentImage++;
			} else {
				(currentImage - 1 < 0) ? currentImage = imagesList.length - 1: currentImage--;
			}

			changeImage();
			selectLink();

			clearInterval(slideshowInterval);
		}



	}

	function onListClick(e) {

		e.preventDefault();

		// Do not interupt previous animation
		if (isAnimating) {
			return;
		}

		var trgt = e.target;

		if (trgt.nodeName === 'A') {

			prevImage = currentImage;
			currentImage = parseInt(trgt.getAttribute('data-order'), 10);
			changeImage();

			selectLink();

			clearInterval(slideshowInterval);
		}
	}

	function selectLink() {

		if (currentLink !== undefined) {
			currentLink.classList.remove(IS_ACTIVE);
		}
		currentLink = linkList[currentImage];
		currentLink.classList.add(IS_ACTIVE);

	}



	function calculateScreen() {
		VW = window.innerWidth;
		VH = window.innerHeight;
		AR = VW / VH;

		canvas0.width = canvas1.width = canvas2.width = canvas3.width = VW;
		canvas0.height = canvas1.height = canvas2.height = canvas3.height = VH;

		partList[0].radius = VW * 0.4;
		partList[1].radius = VW * 0.25;
		partList[2].radius = VW * 0.08;
	}

	function resizeBg() {
		var image1 = imagesList[0];
		IAR = image1.width / image1.height;
		if (IAR < AR) {
			imgW = VW;
			imgH = VW / IAR;
		} else {
			imgW = VH * IAR;
			imgH = VH;
		}
	}

	function slideshowChange () {
		prevImage = currentImage;
		(currentImage + 1 >= imagesList.length) ? currentImage = 0: currentImage++;
		changeImage();
		selectLink();
	}

	function addEL() {

		var debounceResize = debounce(function() {
			calculateScreen();
			resizeBg();
			changeImage();
		}, 200);

		window.addEventListener('resize', debounceResize);
		btns.addEventListener('click', onBtnsClick);
		linklist.addEventListener('click', onListClick);

	}


	function preloadImages() {
		imagesList.forEach(function(img) {

			if (img.complete) {
				handleImageComplete();

			} else {
				img.onload = handleImageComplete;
			}

		});
	}

	function handleImageComplete() {
		imagesloaded++;
		if (imagesloaded === imagesList.length) {
			loadTxt.classList.add('is-hidden');
			addEL();
			init();
		}
	}

	function init() {

		calculateScreen();
		resizeBg();
		selectLink();
		changeImage();
		slideshowInterval = setInterval(slideshowChange,3000);
	}


	function preInit() {
		var alist = linklist.querySelectorAll('a');
		var img;

		for (var i = 0; i < alist.length; i++) {

			linkList.push(alist[i]);

			img = new Image();
			img.src = alist[i].getAttribute('data-imagesrc');
			imagesList.push(img);

		}

		preloadImages();
	}

	preInit();



	/**
	 * Helpers
	 */

	// http://davidwalsh.name/javascript-debounce-function
	function debounce(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this,
				args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	}
})();