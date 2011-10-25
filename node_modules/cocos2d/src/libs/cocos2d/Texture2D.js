/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var util = require('util');

var Texture2D = BObject.extend(/** @lends cocos.Texture2D# */{
	imgElement: null,
	size: null,
    name: null,

    /**
     * @memberOf cocos
     * @constructs
     * @extends BObject
     *
     * @opt {String} [file] The file path of the image to use as a texture
     * @opt {Texture2D|HTMLImageElement} [data] Image data to read from
     */
	init: function (opts) {
		var file = opts.file,
			data = opts.data,
			texture = opts.texture;

		if (file) {
            this.name = file;
			data = resource(file);
		} else if (texture) {
            this.name = texture.get('name');
			data = texture.get('imgElement');
		}

		this.size = {width: 0, height: 0};

		this.set('imgElement', data);
		this.set('size', {width: this.imgElement.width, height: this.imgElement.height});
	},

	drawAtPoint: function (ctx, point) {
		ctx.drawImage(this.imgElement, point.x, point.y);
	},
	drawInRect: function (ctx, rect) {
		ctx.drawImage(this.imgElement,
			rect.origin.x, rect.origin.y,
			rect.size.width, rect.size.height
		);
	},

    /**
     * @getter data
     * @type {String} Base64 encoded image data
     */
    get_data: function () {
        return this.imgElement ? this.imgElement.src : null;
	},

    /**
     * @getter contentSize
     * @type {geometry.Size} Size of the texture
     */
    get_contentSize: function () {
		return this.size;
    }
});

exports.Texture2D = Texture2D;
