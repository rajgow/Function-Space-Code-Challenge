define(["dojo/fx",
		"dojo/_base/fx",
		"dojox/fx/scroll",
		'dojo/domReady!'],function(fx,baseFx,fxScroll){
	var animate = {
		wipeOut : function(node,time) {
			fx.wipeOut({
				node: node,
				duration: time
			}).play();
		},
		wipeIn : function(node,time) {
			fx.wipeIn({
				node: node,
				duration: time
			}).play();
		},
		fadeIt : function(node,time) {
			var fadeArgs = {
				node: node,
				duration: time
			};
			baseFx.fadeIn(fadeArgs).play();
		},
		fadeOut : function(node,time) {
			var fadeArgs = {
				node: node,
				duration: time
			};
			baseFx.fadeOut(fadeArgs).play();
		},
		scrollIntoView : function(node,time) {
			var scrolArgs = {
				node:node,
				win:window,
				duration:time
			}
			fxScroll(scrolArgs).play();
		}
	};
	return animate;
});
