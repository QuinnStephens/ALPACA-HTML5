var cocos = require('cocos2d');
var geom = require('geometry');
var util = require('util');

var Background = cocos.nodes.Node.extend({
	displayName: null,
	sprites: null,
	init:function(){
		Background.superclass.init.call(this);
		var json = JSON.parse('{ "filename":"background.psd", "path":"~/Dropbox/Games/ALPACA/ALPACA_HTML5/src/resources/", "width":700, "height":450, "layers":{ "back":{ "stack":0, "position":[-348, -532], "layerwidth":1680, "layerheight":1050, "transformpoint":"center" }, "floor":{ "stack":1, "position":[0, 271], "layerwidth":824, "layerheight":246, "transformpoint":"center" }, "switch":{ "stack":2, "position":[207, 117], "layerwidth":30, "layerheight":59, "transformpoint":"center" }, "box":{ "stack":3, "position":[150, 304], "layerwidth":181, "layerheight":98, "transformpoint":"center" } } } ');
		var allSprites = Array();
		for (var i in json.layers){
			var thisLayer = json.layers[i];
			var spritefile = '/resources/' + i + '.png';
			var sprite = cocos.nodes.Sprite.create({
				file: spritefile
			});
			sprite.set('anchorPoint', new geom.Point(0,0));
			sprite.set('position', new geom.Point(thisLayer.position[0],thisLayer.position[1]));
			//console.log('Placing ' + i + ' at ' + thisLayer.position[0] + ', ' + thisLayer.position[1]);
			//this.addChild({child: sprite});
			if(i == 'back'){
				this.set('contentSize', sprite.get('contentSize'));
				sprite.set('position', new geom.Point(0,0));
			}
			sprite.set('displayName', i);
			sprite.set('zOrder', thisLayer.stack);
			allSprites.push(sprite);
		}
		this.set('displayName', 'background');
		
		this.set('sprites', allSprites);
	}
});
exports.Background = Background;