var util      = require('util'),
    cocos     = require('cocos2d'),
    geom      = require('geometry');
    
var Item = cocos.nodes.Node.extend({
    sprite: null,
    displayName: null,
    depthSplit: null,
    obstacleNodes: null,
	hitArea: null,
    init:function(sprite){
        Item.superclass.init.call(this);
        
        /* Don't do this - the boundingBox won't correspond to the display location
        // Set the sprite to 0,0 and put the whole item in that location instead
        this.set('position', sprite.get('position'));
        sprite.set('position', new geom.Point(0,0));
        */
        // Same with z-Order
        this.set('zOrder', sprite.get('zOrder'));
        //sprite.set('zOrder', 0);
        
        
        this.set('sprite', sprite);
        this.set('displayName', sprite.get('displayName'));
        this.addChild({child: sprite, z: sprite.get('zOrder')});
        
        //Set depthSplit
        var pos = sprite.get('position');
        var box = sprite.get('boundingBox');
        var height = box.size.height;
        var depthSplit = pos.y + height;
        this.set('depthSplit', depthSplit);
        //console.log(this.get('displayName') + ' ' + depthSplit);
        //console.log(this.get('displayName') + ' is located at ' + pos.x + ', ' + pos.y);

		// Set hitArea
		this.set('hitArea', sprite.get('boundingBox'));
		//console.log(this.get('hitArea'));
    }
});
exports.Item = Item;