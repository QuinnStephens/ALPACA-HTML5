/*globals module exports resource require*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    Texture2D = require('cocos2d/Texture2D').Texture2D,
    cocos = require('cocos2d'),
    nodes = cocos.nodes,
    actions = cocos.actions,
    geo = require('geometry'),
    ccp = geo.ccp;

var sceneIdx = -1;
var transitions = [
    "TMXOrthoTest2",
    "TMXIsoTest"
];

var tests = {};


var kTagTileMap = 1;

function nextAction() {
    sceneIdx++;
    sceneIdx = sceneIdx % transitions.length;

    var r = transitions[sceneIdx];
    return tests[r];
}
function backAction() {
    sceneIdx--;
    if (sceneIdx < 0) {
        sceneIdx += transitions.length;
    }

    var r = transitions[sceneIdx];
    return tests[r];
}
function restartAction() {
    var r = transitions[sceneIdx];
    return tests[r];
}

var TileDemo = nodes.Layer.extend({
    title: 'No title',
    subtitle: null,

    init: function () {
        TileDemo.superclass.init.call(this);

        this.set('isMouseEnabled', true);

        var s = cocos.Director.get('sharedDirector').get('winSize');

        var label = nodes.Label.create({string: this.get('title'), fontName: 'Arial', fontSize: 26});
        this.addChild({child: label, z: 1});
        label.set('position', ccp(s.width / 2, s.height - 50));


        var subtitle = this.get('subtitle');
        if (subtitle) {
            var l = nodes.Label.create({string: subtitle, fontName: "Thonburi", fontSize: 16});
            this.addChild({child: l, z: 1});
            l.set('position', ccp(s.width / 2, s.height - 80));
        }


        var item1 = nodes.MenuItemImage.create({normalImage: module.dirname + "/resources/b1.png", selectedImage: module.dirname + "/resources/b2.png", callback: util.callback(this, 'backCallback')});
        var item2 = nodes.MenuItemImage.create({normalImage: module.dirname + "/resources/r1.png", selectedImage: module.dirname + "/resources/r2.png", callback: util.callback(this, 'restartCallback')});
        var item3 = nodes.MenuItemImage.create({normalImage: module.dirname + "/resources/f1.png", selectedImage: module.dirname + "/resources/f2.png", callback: util.callback(this, 'nextCallback')});

        var menu = nodes.Menu.create({items: [item1, item2, item3]});

        menu.set('position', ccp(0, 0));
        item1.set('position', ccp(s.width / 2 - 100, 30));
        item2.set('position', ccp(s.width / 2, 30));
        item3.set('position', ccp(s.width / 2 + 100, 30));
        this.addChild({child: menu, z: 1});
    },

    mouseDragged: function (event) {
        var node = this.getChild({tag: kTagTileMap});
        var currentPos = node.get('position');
        node.set('position', geo.ccpAdd(currentPos, ccp(event.deltaX, event.deltaY)));
        return true;
    },

    restartCallback: function () {
        var director = cocos.Director.get('sharedDirector');

        var scene = nodes.Scene.create();
        scene.addChild({child: restartAction().create()});

        director.replaceScene(scene);
    },

    backCallback: function () {
        var director = cocos.Director.get('sharedDirector');

        var scene = nodes.Scene.create();
        scene.addChild({child: backAction().create()});

        director.replaceScene(scene);
    },

    nextCallback: function () {
        var director = cocos.Director.get('sharedDirector');

        var scene = nodes.Scene.create();
        scene.addChild({child: nextAction().create()});

        director.replaceScene(scene);
    }
});


tests.TMXOrthoTest2 = TileDemo.extend({
    title: 'Tile Map Test',
    subtitle: 'drag screen',

    init: function () {
        tests.TMXOrthoTest2.superclass.init.call(this);

        var map = nodes.TMXTiledMap.create({file: module.dirname + "/resources/TileMaps/orthogonal-test1.tmx"});
        this.addChild({child: map, z: 0, tag: kTagTileMap});

        var s = cocos.Director.get('sharedDirector').get('winSize');

        map.runAction(actions.ScaleBy.create({duration: 2, scale: 0.5}));
    }
});


tests.TMXIsoTest = TileDemo.extend({
    title: 'TMX Isometric test 0',

    init: function () {
        tests.TMXIsoTest.superclass.init.call(this);   

		/*
        CCLayerColor *color = [CCLayerColor layerWithColor:ccc4(64,64,64,255)];
        [self addChild:color z:-1];
		*/
		
        var map = nodes.TMXTiledMap.create({file: module.dirname + "/resources/TileMaps/iso-test.tmx"});
        this.addChild({child: map, z: 0, tag: kTagTileMap});
		
		// move map to the center of the screen
        var ms = map.get('mapSize'),
            ts = map.get('tileSize');

        map.set('position', ccp(-ms.width * ts.width / 2, -ms.height * ts.height / 2));

        //map.runAction(actions.MoveTo.create({duration: 1.0, position: ccp(-ms.width * ts.width / 2, -ms.height * ts.height / 2)}));
    }
});

// Initialise test
var director = cocos.Director.get('sharedDirector');

director.attachInView(document.getElementById('cocos2d-tests'));
director.set('displayFPS', true);

var scene = nodes.Scene.create();
scene.addChild({child: nextAction().create()});

director.runWithScene(scene);
