var cocos = require('cocos2d');
var geom = require('geometry');
var util = require('util');

var Ball = cocos.nodes.Node.extend({
	velocity: null,
	init: function(){
		Ball.superclass.init.call(this);
		var sprite = cocos.nodes.Sprite.create({
			file: '/resources/sprites.png',
			rect: new geom.Rect(64, 0, 16, 16)
		});
		sprite.set('anchorPoint', new geom.Point(0,0));
		this.addChild({child: sprite});
		this.set('contentSize', sprite.get('contentSize'));
		
		this.set('velocity', new geom.Point(60, 120));
		
		this.scheduleUpdate();
	},
	update:function(dt){
		var pos = util.copy(this.get('position')),
			vel = util.copy(this.get('velocity'));
		pos.x += dt * vel.x;
		pos.y += dt * vel.y;
		this.set('position', pos);
		this.testBatCollision();	
		this.testEdgeCollision();
	},
	testBatCollision:function(){
		var vel = util.copy(this.get('velocity')),
			ballBox = this.get('boundingBox'),
			// Get the bat from the parent layer
			batBox = this.get('parent').get('bat').get('boundingBox');
		// Check for collision if the ball is moving down
		if(vel.y > 0){
			if (geom.rectOverlapsRect(ballBox, batBox)){
				vel.y *= -1;
			}
		}
		this.set('velocity', vel);
	},
	testEdgeCollision:function(){
		var vel = util.copy(this.get('velocity')),
			ballBox = this.get('boundingBox'),
			// Get canvas size
			winSize = cocos.Director.get('sharedDirector').get('winSize');
			// Moving left and hit left edge
			if (vel.x < 0 && geom.rectGetMinX(ballBox) < 0) {
				// Flip X velocity
				vel.x *= -1;
			}
			 
			// Moving right and hit right edge
			if (vel.x > 0 && geom.rectGetMaxX(ballBox) > winSize.width) {
				// Flip X velocity
				vel.x *= -1;
			}
			 
			// Moving up and hit top edge
			if (vel.y < 0 && geom.rectGetMinY(ballBox) < 0) {
				// Flip Y velocity
				vel.y *= -1;
			}
			 
			this.set('velocity', vel);
	}
		
});
exports.Ball = Ball;