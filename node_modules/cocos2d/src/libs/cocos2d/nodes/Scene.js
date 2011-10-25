/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var Node = require('./Node').Node;

var Scene = Node.extend(/** @lends cocos.nodes.Scene */{
    /**
     * Everything in your view will be a child of this object. You need at least 1 scene per app.
     *
     * @memberOf cocos.nodes
     * @constructs
     * @extends cocos.nodes.Node
     */
    init: function () {
        Scene.superclass.init.call(this);
    }

});

module.exports.Scene = Scene;
