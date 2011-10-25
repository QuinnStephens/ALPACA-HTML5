var cocos = require('cocos2d'),
	geom = require('geometry'),
	util = require('util'),
	Player = require('Player').Player;
	Background = require('Background').Background;
	Item = require('Item').Item;

// Create a new layer
var ALPACAHTML5 = cocos.nodes.Layer.extend({
	player: null,
	background: null,
	items: null,
	obstacles: null,
    init: function() {
        // You must always call the super class version of init
        ALPACAHTML5.superclass.init.call(this);
		
		this.set('isMouseEnabled', true);
		
		// Get size of canvas
        var s = cocos.Director.get('sharedDirector').get('winSize');
		
		// Add background
		var background = Background.create();
		var bgSize = background.get('boundingBox').size;
		background.set('position', new geom.Point(bgSize.width/2, bgSize.height/2));
		this.addChild({child: background, z:0});
		this.set('background', background);
		
		// Add interactive items
		var itemSprites = background.get('sprites');
		var items = Array(),
			obstacles = Array();
		for (var i in itemSprites){
			var thisItem = Item.create(itemSprites[i]); 
			this.addChild({child: thisItem, z: thisItem.get('zOrder')});
			items.push(thisItem);
			if (thisItem.get('displayName') != 'back' && thisItem.get('displayName') != 'floor'){ // Get obstacle data from the json file instead
				obstacles.push(thisItem);
			}
		}
		this.set('items', items);
		this.set('obstacles', obstacles);
		//console.log(obstacles);
		// Add player
		var player = Player.create();
		player.set('position', new geom.Point(300, 300));
		this.addChild({child: player});
		this.set('player', player);
		
		this.setPlayerDepth();
		
		// Background music
		var bgmusic = new Audio('/resources/duckburg.mp3');
		bgmusic.play();
		//console.log(bgmusic);
		
    },
	mouseDown: function(evt) {
		var clickPos = evt.locationInCanvas;
		//console.log('User clicked at ' + clickPos.x + ', ' + clickPos.y);
		var clickTarget = this.getClickTarget(clickPos);
		if(clickTarget.get('displayName') == 'floor'){
			var player = this.get('player');
			player.walkTo(clickPos);
			this.scheduleUpdate();
		}
    },
	getClickTarget:function(clickPos){
		var highestNode;
		var highestZ = -1;
		var items = this.get('items');
		for (var i in items){
			var thisItem = items[i];
			if(geom.rectContainsPoint(thisItem.get('sprite').get('boundingBox'), clickPos)){
				var currentZ = thisItem.get('sprite').get('zOrder');
				//console.log('Child ' + thisChild.get('displayName') + ' has z of ' + currentZ);
				if(currentZ > highestZ){
					highestNode = thisItem;
					highestZ = currentZ;
				}
			}
		}
	    console.log("Click target: " + highestNode.get('displayName'));
		return highestNode;
	},
	setPlayerDepth:function(){
		var player = this.get('player'),
			items = this.get('items'),
			playerPos = player.get('position'),
			playerDepth = player.get('zOrder');
		//console.log(playerPos.y);
		for (var i in items){
			var thisItem = items[i];
			if (thisItem.get('displayName') != 'back' && thisItem.get('displayName') != 'floor'){
				var itemSplit = thisItem.get('depthSplit');
				var itemDepth = thisItem.get('zOrder');
				if (playerPos.y > itemSplit && playerDepth < itemDepth){
					console.log('Player should be in front of ' + thisItem.get('displayName'));
					this.reorderChild({child: player, z: itemDepth});
					this.reorderChild({child: thisItem, z: playerDepth});
				} else if (playerPos.y < itemSplit && playerDepth > itemDepth){
					console.log('Player should be behind ' + thisItem.get('displayName'));
					this.reorderChild({child: player, z: itemDepth});
					this.reorderChild({child: thisItem, z: playerDepth});
				}
			}
		}
	},
	checkForCollisions:function(){
		var player = this.get('player'),
			playerPos = util.copy(player.get('position')),
			playerHitArea = util.copy(player.get('hitArea')),
			obstacles = this.get('obstacles');
		// Correct sprite position for hitArea
		playerHitArea.origin.x += playerPos.x;
		playerHitArea.origin.y += playerPos.y;
		//console.log(playerPos);
		//console.log(playerHitArea.origin);
		for (var i in obstacles){
			var thisObstacle = obstacles[i];
			var obstacleHitArea = thisObstacle.get('hitArea');
			if(geom.rectOverlapsRect(playerHitArea, obstacleHitArea)){
				console.log('Player is colliding with ' + thisObstacle.get('displayName'));
			}
		}
	},
	update:function(dt){
		var player = this.get('player'),
			items = this.get('items');
		if(player.get('isWalking')){
			this.setPlayerDepth();
			this.checkForCollisions();
		} else{
			this.pauseSchedulerAndActions();
		}
	}
});

exports.main = function() {
    // Initialise application

    // Get director
    var director = cocos.Director.get('sharedDirector');

    // Attach director to our <div> element
    director.attachInView(document.getElementById('alpacahtml5_app'));

    // Create a scene
    var scene = cocos.nodes.Scene.create();

    // Add our layer to the scene
    scene.addChild({child: ALPACAHTML5.create()});

    // Run the scene
    director.runWithScene(scene);
};
