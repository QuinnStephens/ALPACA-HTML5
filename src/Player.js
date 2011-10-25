var util      = require('util'),
    Texture2D = require('cocos2d/Texture2D').Texture2D,
    cocos     = require('cocos2d'),
    //events    = require('events'),
    nodes     = cocos.nodes,
    actions   = cocos.actions,
    geom      = require('geometry'),
    ccp       = geom.ccp;

var Player = cocos.nodes.Node.extend({
	displayName: null,
	destination: null,
	increments: null,
	walkRate: null,
	targetBuffer: null,
	sprite: null,
	frameCache: null,
	animChache: null,
	yOffset: null,
	isWalking: null,
	hitArea: null,
	init:function(){
		Player.superclass.init.call(this);
		
		var frameCache = cocos.SpriteFrameCache.get('sharedSpriteFrameCache'),
		            animCache = cocos.AnimationCache.get('sharedAnimationCache');

        frameCache.addSpriteFrames({file: module.dirname + '/resources/animations/al/al_basic.plist'});
		this.set('frameCache', frameCache);

        // create walking animation
        var walkFrames = [],
            frame,
            i,
			ii;
        for (i = 1; i < 14; i++) {
			ii = i + 1;
			var frameName = 'al_walk00' + (i >= 10 ? i : '0' + i) + '.png';
			//console.log(frameName);
            frame = frameCache.getSpriteFrame({name: frameName});
            walkFrames.push(frame);
        }

        var animation = cocos.Animation.create({frames: walkFrames, delay: 0.06});
		animCache.addAnimation({animation: animation, name: 'walk'});
		
		this.set('animCache', animCache);
		
		var sprite = nodes.Sprite.create({frame: frameCache.getSpriteFrame({name: 'al_stand.png'})});
		this.addChild({child: sprite});
		this.set('sprite', sprite);
		
		// Add shadow
		var shadow = nodes.Sprite.create({file: module.dirname + '/resources/animations/al/al_shadow.png'});
		this.addChild({child: shadow});
		shadow.set('position', new geom.Point(0, 0));
		this.set('hitArea', shadow.get('boundingBox'));
		//console.log(this.get('hitArea').origin);
		
		var box = sprite.get('boundingBox'),
			yOffset = -box.size.height/2.2;
		this.set('yOffset', yOffset);
		sprite.set('position', new geom.Point(0,yOffset));
		this.set('walkRate', 10);
		this.set('targetBuffer', 10);
		this.set('displayName', 'player');
		//this.set('zOrder', 2);
		
	},
	walkTo:function(clickPos){
		this.pauseSchedulerAndActions();
		this.set('destination', clickPos);
		//console.log('Player is walking to ' + clickPos.x + ', ' + clickPos.y);
		this.getIncrements(clickPos);
		this.scheduleUpdate();	
		this.animateWalking();
		this.set('isWalking', true);
	},
	getIncrements:function(targetPos){
		var pos = this.get('position');
		var xdiff = targetPos.x - pos.x;
		var ydiff = targetPos.y - pos.y;
		var diff = Math.sqrt(Math.pow(xdiff, 2) + Math.pow(ydiff, 2));
		var fraction = this.get('walkRate') / diff;
		var increments = new geom.Point(fraction*xdiff, fraction*ydiff);
		this.set('increments', increments);
		//console.log('Moving at a rate of ' + increments.x + ', ' + increments.y);
	},
	animateWalking:function(){
		var animCache = this.get('animCache'),
			animation = animCache.getAnimation({name: 'walk'});
			animate = actions.Animate.create({animation: animation, restoreOriginalFrame:false}),
			sprite = this.get('sprite');
		sprite.runAction(actions.RepeatForever.create(animate));
	},
	update:function(dt){
		var dest = this.get('destination'),
			pos = this.get('position'),
			incs = this.get('increments'),
			buffer = this.get('targetBuffer'),
			sprite = this.get('sprite'),
			yOffset = this.get('yOffset'),
			frameCache = this.get('frameCache');
		if (pos.x > (dest.x-buffer) && pos.x < (dest.x+buffer) && pos.y > (dest.y-buffer) && pos.y < (dest.y+buffer)){
			//console.log('Reached destination');
			this.pauseSchedulerAndActions();
			this.removeChild({child:sprite});
			sprite = nodes.Sprite.create({frame: frameCache.getSpriteFrame({name: 'al_stand.png'})});
			this.addChild({child: sprite});
			this.set('sprite', sprite);
			sprite.set('position', new geom.Point(0,yOffset));
			this.set('isWalking', false);
		} else{
		  	pos.x += incs.x;
			pos.y += incs.y;
			this.set('position', pos);
			// Make sure the player faces the direction of movement
		  	if (incs.x < 0 && this.scaleX > 0){
				this.scaleX *= -1;
			} else if (incs.x > 0 && this.scaleX < 0){
				this.scaleX *= -1;
			}
		}
	}
});
exports.Player = Player;