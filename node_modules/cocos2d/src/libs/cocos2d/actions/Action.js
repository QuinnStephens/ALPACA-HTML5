/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    console = require('system').console;

/** 
 * @memberOf cocos.actions
 * @class Base class for Actions
 * @extends BObject
 * @constructor
 */
var Action = BObject.extend(/** @lends cocos.actions.Action# */{
    /**
     * The Node the action is being performed on
     * @type cocos.nodes.Node
     */
    target: null,
    originalTarget: null,

    /**
     * Called every frame with it's delta time.
     *
     * @param {Float} dt The delta time
     */
    step: function (dt) {
        console.log('Action.step() Override me');
    },

    /**
     * Called once per frame.
     *
     * @param {Float} time How much of the animation has played. 0.0 = just started, 1.0 just finished.
     */
    update: function (time) {
        console.log('Action.update() Override me');
    },

    /**
     * Called before the action start. It will also set the target.
     *
     * @param {cocos.nodes.Node} target The Node to run the action on
     */
    startWithTarget: function (target) {
        this.target = this.originalTarget = target;
    },

    /**
     * Called after the action has finished. It will set the 'target' to nil.
     * <strong>Important</strong>: You should never call cocos.actions.Action#stop manually.
     * Instead, use cocos.nodes.Node#stopAction(action)
     */
    stop: function () {
        this.target = null;
    },

    /**
     * @getter isDone
     * @type {Boolean} 
     */
    get_isDone: function (key) {
        return true;
    },


    /**
     * Returns a copy of this Action but in reverse
     *
     * @returns {cocos.actions.Action} A new Action in reverse
     */
    reverse: function () {
    }
});

var RepeatForever = Action.extend(/** @lends cocos.actions.RepeatForever# */{
    other: null,

    /**
     * @memberOf cocos.actions
     * @class Repeats an action forever. To repeat the an action for a limited
     * number of times use the cocos.Repeat action.
     * @extends cocos.actions.Action
     * @param {cocos.actions.Action} action An action to repeat forever
     * @constructs
     */
    init: function (action) {
        RepeatForever.superclass.init(this, action);

        this.other = action;
    },

    startWithTarget: function (target) {
        RepeatForever.superclass.startWithTarget.call(this, target);

        this.other.startWithTarget(this.target);
    },

    step: function (dt) {
        this.other.step(dt);
        if (this.other.get('isDone')) {
            var diff = dt - this.other.get('duration') - this.other.get('elapsed');
            this.other.startWithTarget(this.target);

            this.other.step(diff);
        }
    },

    get_isDone: function () {
        return false;
    },

    reverse: function () {
        return RepeatForever.create(this.other.reverse());
    },

    copy: function () {
        return RepeatForever.create(this.other.copy());
    }
});

var FiniteTimeAction = Action.extend(/** @lends cocos.actions.FiniteTimeAction# */{
    /**
     * Number of seconds to run the Action for
     * @type Float
     */
    duration: 2,

    /** 
     * Repeats an action a number of times. To repeat an action forever use the
     * cocos.RepeatForever action.
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.Action
     */
    init: function () {
        FiniteTimeAction.superclass.init.call(this);
    },

    /** @ignore */
    reverse: function () {
        console.log('FiniteTimeAction.reverse() Override me');
    }
});

exports.Action = Action;
exports.RepeatForever = RepeatForever;
exports.FiniteTimeAction = FiniteTimeAction;
