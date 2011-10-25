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
    "Sprite1",
    "SpriteBatchNode1",
    "SpriteAnchorPoint",
    "SpriteAnimationFlip",
    "SpriteZOrder",
    "AnimationCache"
];

var tests = {};

var kTagTileMap = 1,
    kTagSpriteBatchNode = 1,
    kTagNode = 2,
    kTagAnimation1 = 1,
    kTagSpriteLeft = 2,
    kTagSpriteRight = 3;

var kTagSprite1 = 1,
    kTagSprite2 = 2,
    kTagSprite3 = 3,
    kTagSprite4 = 4,
    kTagSprite5 = 5,
    kTagSprite6 = 6,
    kTagSprite7 = 7,
    kTagSprite8 = 8;

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

var SpriteDemo = nodes.Layer.extend({
    title: 'No title',
    subtitle: null,

    init: function () {
        SpriteDemo.superclass.init.call(this);

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

/**
 * @class
 *
 * Example Sprite 1
 */
tests.Sprite1 = SpriteDemo.extend(/** @lends Sprite1.prototype# */{
    title: 'Sprite',
    subtitle: 'Click screen',

    init: function () {
        tests.Sprite1.superclass.init.call(this);

        this.set('isMouseEnabled', true);

        var s = cocos.Director.get('sharedDirector').get('winSize');
        this.addNewSprite(ccp(s.width / 2, s.height / 2));
    },

    addNewSprite: function (point) {
        var idx = Math.floor(Math.random() * 1400 / 100),
            x = (idx % 5) * 85,
            y = (idx % 3) * 121;

        var sprite = nodes.Sprite.create({file: module.dirname + "/resources/grossini_dance_atlas.png", rect: new geo.Rect(x, y, 85, 121)});
        this.addChild({child: sprite, z: 0});
        sprite.set('position', ccp(point.x, point.y));

        var action, actionBack, seq;
        var rand = Math.random();

        if (rand < 0.2) {
            action = actions.ScaleBy.create({duration: 3, scale: 2});
        } else if (rand < 0.4) {
            action = actions.RotateBy.create({duration: 3, angle: 360});
        } else if (rand < 0.6) {
            action = actions.ScaleBy.create({duration: 3, scale: 2});
            //action = cocos.Blink.create({duration:3, scale:2});
        } else if (rand < 0.8) {
            action = actions.RotateBy.create({duration: 3, angle: 360});
            //action = cocos.TintBy.create({duration:3, scale:2});
        } else {
            action = actions.ScaleBy.create({duration: 3, scale: 2});
            //action = cocos.FadeOut.create({duration:3, scale:2});
        }




        actionBack = action.reverse();
        seq = actions.Sequence.create({actions: [action, actionBack]});
        sprite.runAction(actions.RepeatForever.create(seq));
        
    },
    mouseUp: function (event) {
        var location = cocos.Director.get('sharedDirector').convertEventToCanvas(event);
        this.addNewSprite(location);

        return true;
    }
});


/**
 * @class
 *
 * Example SpriteBatchNode 1
 */
tests.SpriteBatchNode1 = SpriteDemo.extend(/** @lends SpriteBatchNode1.prototype# */{
    title: 'SpriteBatchNode',
    subtitle: 'Click screen',

    init: function () {
        tests.SpriteBatchNode1.superclass.init.call(this);

        this.set('isMouseEnabled', true);

        var batch = nodes.SpriteBatchNode.create({file: module.dirname + "/resources/grossini_dance_atlas.png", size: geo.sizeMake(480, 320)});
        this.addChild({child: batch, z: 0, tag: kTagSpriteBatchNode});

        var s = cocos.Director.get('sharedDirector').get('winSize');
        this.addNewSprite(ccp(s.width / 2, s.height / 2));
    },

    addNewSprite: function (point) {
        var batch = this.getChild({tag: kTagSpriteBatchNode});

        var idx = Math.floor(Math.random() * 1400 / 100),
            x = (idx % 5) * 85,
            y = (idx % 3) * 121;

        var sprite = nodes.Sprite.create({textureAtlas: batch.get('textureAtlas'), rect: geo.rectMake(x, y, 85, 121)});
        batch.addChild({child: sprite});

        sprite.set('position', ccp(point.x, point.y));

        var action, actionBack, seq;
        var rand = Math.random();

        if (rand < 0.2) {
            action = actions.ScaleBy.create({duration: 3, scale: 2});
        } else if (rand < 0.4) {
            action = actions.RotateBy.create({duration: 3, angle: 360});
        } else if (rand < 0.6) {
            action = actions.ScaleBy.create({duration: 3, scale: 2});
            //action = cocos.Blink.create({duration:3, scale:2});
        } else if (rand < 0.8) {
            action = actions.RotateBy.create({duration: 3, angle: 360});
            //action = cocos.TintBy.create({duration:3, scale:2});
        } else {
            action = actions.ScaleBy.create({duration: 3, scale: 2});
            //action = cocos.FadeOut.create({duration: 3, scale: 2});
        }

        actionBack = action.reverse();
        seq = actions.Sequence.create({actions: [action, actionBack]});
        sprite.runAction(actions.RepeatForever.create(seq));
    },
    mouseUp: function (event) {

        var location = cocos.Director.get('sharedDirector').convertEventToCanvas(event);
        this.addNewSprite(location);

        return true;
    }
});


/**
 * @class
 *
 * Example Sprite Animation and flip
 */
tests.SpriteAnimationFlip = SpriteDemo.extend(/** @lends SpriteAnimationFlip.prototype# */{
    title: 'Sprite Animation + Flip',

    init: function () {
        tests.SpriteAnimationFlip.superclass.init.call(this);

        var s = cocos.Director.get('sharedDirector').get('winSize');

        var texture = Texture2D.create({file: module.dirname + "/resources/animations/dragon_animation.png"});

        var frame0 = cocos.SpriteFrame.create({texture: texture, rect: geo.rectMake(132 * 0, 132 * 0, 132, 132)}),
            frame1 = cocos.SpriteFrame.create({texture: texture, rect: geo.rectMake(132 * 1, 132 * 0, 132, 132)}),
            frame2 = cocos.SpriteFrame.create({texture: texture, rect: geo.rectMake(132 * 2, 132 * 0, 132, 132)}),
            frame3 = cocos.SpriteFrame.create({texture: texture, rect: geo.rectMake(132 * 3, 132 * 0, 132, 132)}),
            frame4 = cocos.SpriteFrame.create({texture: texture, rect: geo.rectMake(132 * 0, 132 * 1, 132, 132)}),
            frame5 = cocos.SpriteFrame.create({texture: texture, rect: geo.rectMake(132 * 1, 132 * 1, 132, 132)});


        var sprite = nodes.Sprite.create({frame: frame0});
        sprite.set('position', ccp(s.width / 2 - 80, s.height / 2));
        this.addChild(sprite);

        var animFrames = [
            frame0,
            frame1,
            frame2,
            frame3,
            frame4,
            frame5
        ];


        var animation = cocos.Animation.create({frames: animFrames, delay: 0.2}),
            animate   = actions.Animate.create({animation: animation, restoreOriginalFrame: false}),
            seq       = actions.Sequence.create({actions: [animate,
                                                         actions.FlipX.create({flipX: true}),
                                                         animate.copy(),
                                                         actions.FlipX.create({flipX: false})]});

        sprite.runAction(actions.RepeatForever.create(seq));
    }
});

/**
 * @class
 *
 * Example Sprite Anchor Point
 */
tests.SpriteAnchorPoint = SpriteDemo.extend(/** @lends SpriteAnchorPoint.prototype# */{
    title: 'Sprite Anchor Point',

    init: function () {
        tests.SpriteAnchorPoint.superclass.init.call(this);

        var s = cocos.Director.get('sharedDirector').get('winSize');

        var rotate = actions.RotateBy.create({duration: 10, angle: 360});
        var action = actions.RepeatForever.create(rotate);
        for (var i = 0; i < 3; i++) {
            var sprite = nodes.Sprite.create({file: module.dirname + "/resources/grossini_dance_atlas.png", rect: geo.rectMake(85 * i, 121 * 1, 85, 121)});
            sprite.position = ccp(s.width / 4 * (i + 1), s.height / 2);
            
            var point = nodes.Sprite.create({file: module.dirname + "/resources/r1.png"});
            point.set('scale', 0.25);
            point.set('position', sprite.get('position'));
            this.addChild({child: point, z: 10});
            
            switch (i) {
            case 0:
                sprite.set('anchorPoint', ccp(0, 0));
                break;
            case 1:
                sprite.set('anchorPoint', ccp(0.5, 0.5));
                break;
            case 2:
                sprite.set('anchorPoint', ccp(1, 1));
                break;
            }
            
            point.set('position', sprite.get('position'));
            
            var copy = action.copy();
            sprite.runAction(copy);
            this.addChild({child: sprite, z: 1});
        }
    }
});
        

/**
 * @class
 *
 * Example Sprite Z ORder
 */
tests.SpriteZOrder = SpriteDemo.extend(/** @lends SpriteZOrder.prototype# */{
    title: 'Sprite Z Order',
    dir: 1,

    init: function () {
        tests.SpriteZOrder.superclass.init.call(this);

        var s = cocos.Director.get('sharedDirector').get('winSize');

        var i;
        var step = s.width / 11;
        var sprite;
        for (i = 0; i < 5; i++) {
            sprite = nodes.Sprite.create({file: module.dirname + "/resources/grossini_dance_atlas.png", rect: geo.rectMake(85 * 0, 121 * 1, 85, 121)});
            sprite.set('position', ccp((i + 1) * step, s.height / 2));
            this.addChild({child: sprite, z: i});
        }
        
        for (i = 5; i < 10; i++) {
            sprite = nodes.Sprite.create({file: module.dirname + "/resources/grossini_dance_atlas.png", rect: geo.rectMake(85 * 1, 121 * 0, 85, 121)});
            sprite.set('position', ccp((i + 1) * step, s.height / 2));
            this.addChild({child: sprite, z: 14 - i});
        }
        
        sprite = nodes.Sprite.create({file: module.dirname + "/resources/grossini_dance_atlas-red.png", rect: geo.rectMake(85 * 3, 121 * 0, 85, 121)});
        this.addChild({child: sprite, z: -1, tag: kTagSprite1});

        sprite.set('position', ccp(s.width / 2, s.height / 2 + 20));
        sprite.set('scaleX', 6);
        
        cocos.Scheduler.get('sharedScheduler').schedule({target: this, method: this.reorderSprite, interval: 1});
    },
    reorderSprite: function (dt) {
        var sprite = this.getChild({tag: kTagSprite1});
        var z = sprite.get('zOrder');
    
        if (z < -1) {
            this.dir = 1;
        }
        if (z > 10) {
            this.dir = -1;
        }
        
        z += this.dir * 3;
    
        this.reorderChild({child: sprite, z: z});
    }
});

/**
 * @class
 *
 * Example using AnimationCache and loading from a Zwoptex .plist file
 */
tests.AnimationCache = SpriteDemo.extend(/** @lends AnimationCache.prototype# */{
    title: 'AnimationCache',
    subtitle: 'Sprite should be animated',

    init: function () {
        tests.AnimationCache.superclass.init.call(this);

        var frameCache = cocos.SpriteFrameCache.get('sharedSpriteFrameCache'),
            animCache = cocos.AnimationCache.get('sharedAnimationCache');

        frameCache.addSpriteFrames({file: module.dirname + '/resources/animations/grossini.plist'});
        frameCache.addSpriteFrames({file: module.dirname + '/resources/animations/grossini_gray.plist'});
        frameCache.addSpriteFrames({file: module.dirname + '/resources/animations/grossini_blue.plist'});


        // create "dance" animation
        var animFrames = [],
            frame,
            i;
        for (i = 1; i < 15; i++) {
            frame = frameCache.getSpriteFrame({name: 'grossini_dance_' + (i >= 10 ? i : '0' + i) + '.png'});
            animFrames.push(frame);
        }
        
        var animation = cocos.Animation.create({frames: animFrames, delay: 0.2});
        
        // Add an animation to the Cache
        animCache.addAnimation({animation: animation, name: 'dance'});
        
        
        // create animation "dance gray"
        animFrames = [];
        for (i = 1; i < 15; i++) {
            frame = frameCache.getSpriteFrame({name: 'grossini_dance_gray_' + (i >= 10 ? i : '0' + i) + '.png'});
            animFrames.push(frame);
        }
        
        animation = cocos.Animation.create({frames: animFrames, delay: 0.2});
        
        // Add an animation to the Cache
        animCache.addAnimation({animation: animation, name: 'dance_gray'});


        // create animation "dance blue"
        animFrames = [];
        for (i = 1; i < 4; i++) {
            frame = frameCache.getSpriteFrame({name: 'grossini_blue_0' + i + '.png'});
            animFrames.push(frame);
        }
        
        animation = cocos.Animation.create({frames: animFrames, delay: 0.2});
        
        // Add an animation to the Cache
        animCache.addAnimation({animation: animation, name: 'dance_blue'});
        
    
        var normal     = animCache.getAnimation({name: 'dance'}),
            dance_gray = animCache.getAnimation({name: 'dance_gray'}),
            dance_blue = animCache.getAnimation({name: 'dance_blue'});
        
        var animN = actions.Animate.create({animation: normal}),
            animG = actions.Animate.create({animation: dance_gray}),
            animB = actions.Animate.create({animation: dance_blue});

        var seq = actions.Sequence.create({actions: [animN, animG, animB]});
        
        // create an sprite without texture
        var grossini = nodes.Sprite.create();
        
        var winSize = cocos.Director.get('sharedDirector').get('winSize');
        
        grossini.set('position', ccp(winSize.width / 2, winSize.height / 2));
        
        this.addChild({child: grossini});
        
        
        // run the animation
        grossini.runAction(seq);
    }
});
                
        

// Initialise test
var director = cocos.Director.get('sharedDirector');

director.attachInView(document.getElementById('cocos2d-tests'));
director.set('displayFPS', true);

var scene = nodes.Scene.create();
scene.addChild({child: nextAction().create()});

director.runWithScene(scene);
