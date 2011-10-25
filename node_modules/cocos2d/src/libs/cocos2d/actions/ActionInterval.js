/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util'),
    act = require('./Action'),
    ccp = require('geometry').ccp;

var ActionInterval = act.FiniteTimeAction.extend(/** @lends cocos.actions.ActionInterval# */{
    /**
     * Number of seconds that have elapsed
     * @type Float
     */
    elapsed: 0.0,

    _firstTick: true,

    /**
     * Base class actions that do have a finite time duration. 
     *
     * Possible actions:
     *
     * - An action with a duration of 0 seconds
     * - An action with a duration of 35.5 seconds Infinite time actions are valid
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.FiniteTimeAction
     *
     * @opt {Float} duration Number of seconds to run action for
     */
    init: function (opts) {
        ActionInterval.superclass.init.call(this, opts);

        var dur = opts.duration || 0;
        if (dur === 0) {
            dur = 0.0000001;
        }

        this.set('duration', dur);
        this.set('elapsed', 0);
        this._firstTick = true;
    },

    get_isDone: function () {
        return (this.elapsed >= this.duration);
    },

    step: function (dt) {
        if (this._firstTick) {
            this._firstTick = false;
            this.elapsed = 0;
        } else {
            this.elapsed += dt;
        }

        this.update(Math.min(1, this.elapsed / this.duration));
    },

    startWithTarget: function (target) {
        ActionInterval.superclass.startWithTarget.call(this, target);

        this.elapsed = 0.0;
        this._firstTick = true;
    },

    reverse: function () {
        throw "Reverse Action not implemented";
    }
});

var ScaleTo = ActionInterval.extend(/** @lends cocos.actions.ScaleTo# */{
    /**
     * Current X Scale
     * @type Float
     */
    scaleX: 1,

    /**
     * Current Y Scale
     * @type Float
     */
    scaleY: 1,

    /**
     * Initial X Scale
     * @type Float
     */
    startScaleX: 1,

    /**
     * Initial Y Scale
     * @type Float
     */
    startScaleY: 1,

    /**
     * Final X Scale
     * @type Float
     */
    endScaleX: 1,

    /**
     * Final Y Scale
     * @type Float
     */
    endScaleY: 1,

    /**
     * Delta X Scale
     * @type Float
     * @private
     */
    deltaX: 0.0,

    /**
     * Delta Y Scale
     * @type Float
     * @private
     */
    deltaY: 0.0,

    /**
     * Scales a cocos.Node object to a zoom factor by modifying it's scale attribute.
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {Float} [scale] Size to scale Node to
     * @opt {Float} [scaleX] Size to scale width of Node to
     * @opt {Float} [scaleY] Size to scale height of Node to
     */
    init: function (opts) {
        ScaleTo.superclass.init.call(this, opts);

        if (opts.scale !== undefined) {
            this.endScaleX = this.endScaleY = opts.scale;
        } else {
            this.endScaleX = opts.scaleX;
            this.endScaleY = opts.scaleY;
        }


    },

    startWithTarget: function (target) {
        ScaleTo.superclass.startWithTarget.call(this, target);

        this.startScaleX = this.target.get('scaleX');
        this.startScaleY = this.target.get('scaleY');
        this.deltaX = this.endScaleX - this.startScaleX;
        this.deltaY = this.endScaleY - this.startScaleY;
    },

    update: function (t) {
        if (!this.target) {
            return;
        }
        
        this.target.set('scaleX', this.startScaleX + this.deltaX * t);
        this.target.set('scaleY', this.startScaleY + this.deltaY * t);
    }
});

var ScaleBy = ScaleTo.extend(/** @lends cocos.actions.ScaleBy# */{
    /**
     * Scales a cocos.Node object to a zoom factor by modifying it's scale attribute.
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ScaleTo
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {Float} [scale] Size to scale Node by
     * @opt {Float} [scaleX] Size to scale width of Node by
     * @opt {Float} [scaleY] Size to scale height of Node by
     */
    init: function (opts) {
        ScaleBy.superclass.init.call(this, opts);
    },

    startWithTarget: function (target) {
        ScaleBy.superclass.startWithTarget.call(this, target);

        this.deltaX = this.startScaleX * this.endScaleX - this.startScaleX;
        this.deltaY = this.startScaleY * this.endScaleY - this.startScaleY;
    },

    reverse: function () {
        return ScaleBy.create({duration: this.duration, scaleX: 1 / this.endScaleX, scaleY: 1 / this.endScaleY});
    }
});


var RotateTo = ActionInterval.extend(/** @lends cocos.actions.RotateTo# */{
    /**
     * Final angle
     * @type Float
     */
    dstAngle: 0,

    /**
     * Initial angle
     * @type Float
     */
    startAngle: 0,

    /**
     * Angle delta
     * @type Float
     */
    diffAngle: 0,

    /**
     * Rotates a cocos.Node object to a certain angle by modifying its rotation
     * attribute. The direction will be decided by the shortest angle.
     * 
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {Float} angle Angle in degrees to rotate to
     */
    init: function (opts) {
        RotateTo.superclass.init.call(this, opts);

        this.dstAngle = opts.angle;
    },

    startWithTarget: function (target) {
        RotateTo.superclass.startWithTarget.call(this, target);

        this.startAngle = target.get('rotation');

        if (this.startAngle > 0) {
            this.startAngle = (this.startAngle % 360);
        } else {
            this.startAngle = (this.startAngle % -360);
        }

        this.diffAngle = this.dstAngle - this.startAngle;
        if (this.diffAngle > 180) {
            this.diffAngle -= 360;
        } else if (this.diffAngle < -180) {
            this.diffAngle += 360;
        }
    },

    update: function (t) {
        this.target.set('rotation', this.startAngle + this.diffAngle * t);
    }
});

var RotateBy = RotateTo.extend(/** @lends cocos.actions.RotateBy# */{
    /**
     * Number of degrees to rotate by
     * @type Float
     */
    angle: 0,

    /**
     * Rotates a cocos.Node object to a certain angle by modifying its rotation
     * attribute. The direction will be decided by the shortest angle.
     *
     * @memberOf cocos.action
     * @constructs
     * @extends cocos.actions.RotateTo
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {Float} angle Angle in degrees to rotate by
     */
    init: function (opts) {
        RotateBy.superclass.init.call(this, opts);

        this.angle = opts.angle;
    },

    startWithTarget: function (target) {
        RotateBy.superclass.startWithTarget.call(this, target);

        this.startAngle = this.target.get('rotation');
    },

    update: function (t) {
        this.target.set('rotation', this.startAngle + this.angle * t);
    },

    reverse: function () {
        return RotateBy.create({duration: this.duration, angle: -this.angle});
    },

    copy: function () {
        return RotateBy.create({duration: this.duration, angle: this.angle});
    }
});



var Sequence = ActionInterval.extend(/** @lends cocos.actions.Sequence# */{
    /**
     * Array of actions to run
     * @type cocos.Node[]
     */
    actions: null,

    /**
     * The array index of the currently running action
     * @type Integer
     */
    currentActionIndex: 0,

    /**
     * The duration when the current action finishes
     * @type Float
     */
    currentActionEndDuration: 0,

    /**
     * Runs a number of actions sequentially, one after another
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {cocos.actions.Action[]} Array of actions to run in sequence
     */
    init: function (opts) {
        Sequence.superclass.init.call(this, opts);

        this.actions = util.copy(opts.actions);
        this.actionSequence = {};
        
        util.each(this.actions, util.callback(this, function (action) {
            this.duration += action.duration;
        }));
    },

    startWithTarget: function (target) {
        Sequence.superclass.startWithTarget.call(this, target);

        this.currentActionIndex = 0;
        this.currentActionEndDuration = this.actions[0].get('duration');
        this.actions[0].startWithTarget(this.target);
    },

    stop: function () {
        util.each(this.actions, function (action) {
            action.stop();
        });

        Sequence.superclass.stop.call(this);
    },

    step: function (dt) {
        if (this._firstTick) {
            this._firstTick = false;
            this.elapsed = 0;
        } else {
            this.elapsed += dt;
        }

        this.actions[this.currentActionIndex].step(dt);
        this.update(Math.min(1, this.elapsed / this.duration));
    },

    update: function (dt) {
        // Action finished onto the next one
        if (this.elapsed > this.currentActionEndDuration) {
            var previousAction = this.actions[this.currentActionIndex];
            previousAction.update(1.0);
            previousAction.stop();


            this.currentActionIndex++;

            if (this.currentActionIndex < this.actions.length) {
                var currentAction = this.actions[this.currentActionIndex];
                currentAction.startWithTarget(this.target);

                this.currentActionEndDuration += currentAction.duration;
            }
        }
    }
});

var Animate = ActionInterval.extend(/** @lends cocos.actions.Animate# */{
    animation: null,
    restoreOriginalFrame: true,
    origFrame: null,


    /**
     * Animates a sprite given the name of an Animation 
     *
     * @memberOf cocos.actions
     * @constructs
     * @extends cocos.actions.ActionInterval
     *
     * @opt {Float} duration Number of seconds to run action for
     * @opt {cocos.Animation} animation Animation to run
     * @opt {Boolean} [restoreOriginalFrame=true] Return to first frame when finished
     */
    init: function (opts) {
        this.animation = opts.animation;
        this.restoreOriginalFrame = opts.restoreOriginalFrame !== false;
        opts.duration = this.animation.frames.length * this.animation.delay;

        Animate.superclass.init.call(this, opts);
    },

    startWithTarget: function (target) {
        Animate.superclass.startWithTarget.call(this, target);

        if (this.restoreOriginalFrame) {
            this.set('origFrame', this.target.get('displayedFrame'));
        }
    },

    stop: function () {
        if (this.target && this.restoreOriginalFrame) {
            var sprite = this.target;
            sprite.set('displayFrame', this.origFrame);
        }

        Animate.superclass.stop.call(this);
    },

    update: function (t) {
        var frames = this.animation.get('frames'),
            numberOfFrames = frames.length,
            idx = Math.floor(t * numberOfFrames);

        if (idx >= numberOfFrames) {
            idx = numberOfFrames - 1;
        }

        var sprite = this.target;
        if (!sprite.isFrameDisplayed(frames[idx])) {
            sprite.set('displayFrame', frames[idx]);
        }
    },

    copy: function () {
        return Animate.create({animation: this.animation, restoreOriginalFrame: this.restoreOriginalFrame});
    }

});

exports.ActionInterval = ActionInterval;
exports.ScaleTo = ScaleTo;
exports.ScaleBy = ScaleBy;
exports.RotateTo = RotateTo;
exports.RotateBy = RotateBy;
exports.Sequence = Sequence;
exports.Animate = Animate;
