/*globals require module exports process console __dirname*/
/*jslint undef: true, strict: true, white: true, newcap: true, indent: 4 */
"use strict";

var sys       = require('sys'),
    opts      = require('../opts'),
    fs        = require('fs'),
    path      = require('path'),
    Template  = require('../template').Template,
    mimetypes = require('../mimetypes');

var OPTIONS = [
    {   short: 'f',
        long: 'file',
        description: 'File to write output to. Overrides config file',
        value: true },

    {   short: 'c',
        long: 'config',
        description: 'Configuration file. Default is make.json',
        value: true }
];

mimetypes.addType('application/xml', '.tmx');
mimetypes.addType('application/xml', '.tsx');
mimetypes.addType('application/xml', '.plist');

var RESOURCE_TEMPLATE = new Template('__resources__["$resource$"] = {meta: {mimetype: "$mimetype$"}, data: $data$};');
var TEXT_MIMETYPES = 'application/xml text/plain text/json application/json text/html'.split(' ');
var CODE_MIMETYPES = 'text/javascript application/javascript application/x-javascript'.split(' ');


var DEFAULT_MAKE_JSON = {
    output: "cocos2d-app.js",
    extensions: ["js", "gif", "jpeg", "jpg", "png", "tmx", "tsx", "plist"],
    ignore: null,
    main_module: "main",
    paths: {}
};
DEFAULT_MAKE_JSON.paths[path.join(__dirname, '../../../src')] = '/__builtin__';

/**
 * Merge an number of objects together and return the result as a new object
 */
function merge() {
    var o = {};
    for (var i = 0, len = arguments.length; i < len; i++) {
        var obj = arguments[i];
        for (var x in obj) {
            if (obj.hasOwnProperty(x)) {
                o[x] = obj[x];
            }
        }
    }

    return o;
}

/**
 * Merges 2 objects loaded from a make.json files or simiular.
 *
 * @param {Object} conf1 First config
 * @param {Object} conf2 Second config. Will override conf1
 * @returns Object A new object
 */
function mergeMakeConfig(conf1, conf2) {
    var o = merge(conf1, conf2);
    o.paths = merge(conf1.paths, conf2.paths);
    return o;
}

/**
 * @memberOf cocos.commands.make
 * @class Compile a cocos2d project into a single javascript file
 * @param {String} [configFile=make.json] The project's config filename
 */
function Compiler(configFile) {
    this.readConfig = function (configFile) {
        sys.puts('Loading config: ' + configFile);

        var config = this.readJSONFile(configFile);
        config = mergeMakeConfig(DEFAULT_MAKE_JSON, config);
        this.output = config.output;
        this.mainModule = config.mainModule || config.main_module;
        this.extensions = config.extensions;

        return config;
    };

    this.config = this.readConfig(configFile || 'make.json');
}
(function () /** @lends cocos.commands.make.Compiler# */{

    /**
     * Read a JSON file and clean up any comments, unquoted keys and trailing
     * commas before returning the object
     *
     * @param {String} filename Name of the JSON file to read
     * @returns {Object} The JSON object
     */
    this.readJSONFile = function (filename) {
        var j = fs.readFileSync(filename, 'utf8');

        // Strip comments
        j = j.replace(/\/\/.*/g, '');
        j = j.replace(/\/\*(.|[\n\r])*?\*\//mg, '');

        // Fix unquoted keys
        j = j.replace(/\{\s*(\w)/g, '{"$1');
        j = j.replace(/,(\s*)(\w)/g, ',$1"$2');
        j = j.replace(/(\w):/g, '$1":');

        // Fix trailing comma
        j = j.replace(/,\s+\}/mg, '}');

        return JSON.parse(j);
    };

    this.__defineGetter__('appConfigFiles', function () {
        if (this.appConfigFiles_) {
            return this.appConfigFiles_;
        }

        var configs = ['src/libs/cocos2d/config.json', 'cocos2d/src/libs/cocos2d/config.json'];

        for (var source in this.config.paths) {
            if (this.config.paths.hasOwnProperty(source)) {
                var dest = this.config.paths[source];


                var c = path.join(source, 'config.json');
                if (path.existsSync(c)) {
                    configs.push(c);
                }
                c = path.join(source, 'libs/cocos2d/config.json');
                if (path.existsSync(c)) {
                    configs.push(c);
                }
            }
        }

        this.appConfigFiles_ = configs;

        return this.appConfigFiles_;
    });

    /**
     * Reads all the app's config.js files and returns an of object their
     * values
     */
    this.__defineGetter__('appConfig', function () {
        if (this.appConfig_) {
            return this.appConfig_;
        }

        var vals = {}, data;
        for (var i = 0, len = this.appConfigFiles.length; i < len; i++) {
            var config = this.appConfigFiles[i];
            if (path.existsSync(config)) {
                data = this.readJSONFile(config);
                vals = merge(vals, data);
            }
        }

        this.appConfig_ = vals;
        return this.appConfig_;
    });

    /**
     * Compile everything into a single script
     */
    this.make = function () {
        var code = this.header || '';
        code += '\n(function() {\n';
        code += 'var __main_module_name__ = ' + JSON.stringify(this.mainModule) + ';\n';
        code += 'var __resources__ = {};\n';
        code += 'function __imageResource(data) { var img = new Image(); img.src = data; return img; };\n';

        // Add config options
        for (var key in this.appConfig) {
            if (this.appConfig.hasOwnProperty(key)) {
                code += 'var ' + key.toUpperCase() + ' = ' + JSON.stringify(this.appConfig[key]) + ';\n';
            }
        }

        // Add all the code/images/etc
        for (var source in this.config.paths) {
            if (this.config.paths.hasOwnProperty(source)) {
                var dest = this.config.paths[source];
                code += this.makePath(source, dest);
            }
        }

        var module_js = path.join(__dirname, 'module_js');
        code += fs.readFileSync(module_js, 'utf8');

        code += '\n})();\n';

        code += this.footer || '';

        return code;
    };

    /**
     * Compile everything at a path and return the code
     * 
     * @param {String} source Path to compile
     * @param {String} [dest=source] Output path
     * @returns {String} Compiled javascript source code
     */
    this.makePath = function (source, dest) {
        sys.puts('Building Path: ' + source + ' => ' + dest);

        var code = '';
        var files = this.scanForFiles(source);
        for (var i = 0, len = files.length; i < len; i++) {
            var sourceFile = files[i];
            if (!!~this.appConfigFiles.indexOf(sourceFile)) {
                continue;
            }

            var destFile = this.destForSource(sourceFile),
                mimetype = mimetypes.guessType(sourceFile);
                

            sys.puts('Building File: ' + sourceFile + ' => ' + destFile);
            code += '\n';
            code += RESOURCE_TEMPLATE.substitute({
                'mimetype': mimetype,
                'resource': destFile,
                'data': this.makeResource(sourceFile)
            });
        }


        return code;
    };

    this.destForSource = function (path) {
        for (var source in this.config.paths) {
            if (this.config.paths.hasOwnProperty(source)) {
                var dest = this.config.paths[source];

                // Source starts with config path
                if (path.indexOf(source) === 0) {
                    return path.replace(source, dest).replace(/\/+/, '/');
                }
            }
        }

        return source;
    };

    this.makeResource = function (filename) {
        var mimetype = mimetypes.guessType(filename);

        var isCode = (!!~CODE_MIMETYPES.indexOf(mimetype)),
            isText = (!!~TEXT_MIMETYPES.indexOf(mimetype)),
            isImage = (mimetype.split('/')[0] == 'image');

        var data;
        if (isCode) {
            data = fs.readFileSync(filename, 'utf8');
            data = "function(exports, require, module, __filename, __dirname) {\n" + data + "\n}";
        } else if (isText) {
            data = JSON.stringify(fs.readFileSync(filename, 'utf8'));
        } else if (isImage) {
            data = fs.readFileSync(filename).toString('base64');
            data = '__imageResource("data:' + mimetype + ';base64,' + data + '")';
        } else /* isBinary */ {
            data = JSON.stringify(fs.readFileSync(filename).toString('base64'));
        }

        return data;
    };

    this.guessMimeType = function (filename) {
        return 'image/png';
    };

    /**
     * Scan for files to build and return them as an array
     *
     * @param {String} source Path to scan
     * @returns {String[]} List of filenames
     */
    this.scanForFiles = function (source) {

        if (!path.existsSync(source)) {
            console.log('ERROR: Unable to find path: ', source);
            return [];
        }

        var foundFiles = [];

        // If given a file rather than a directory they just return that
        if (fs.statSync(source).isFile()) {
            return [source];
        }

        // Find all files in directory
        var files = fs.readdirSync(source);
        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];
            // Skip hidden files
            if (file[0] == '.') {
                continue;
            }

            var fullPath = path.join(source, file);

            if (fs.statSync(fullPath).isFile()) {
                // If extension isn't in our list then skip file
                if (this.extensions && this.extensions.length && !~this.extensions.indexOf(path.extname(file).slice(1))) {
                    continue;
                }

                foundFiles.push(fullPath);
            } else {
                // Directory
                foundFiles = foundFiles.concat(this.scanForFiles(fullPath));
            }

        }
        
        return foundFiles;
    };
}).call(Compiler.prototype);

exports.Compiler = Compiler;

function mkdir(dir, mode) {
    mode = mode || 511; // Octal = 0777;
    
    if (dir[0] != '/') {
        dir = path.join(process.cwd(), dir);
    }

    var paths = [dir];
    var d = dir;
    while ((d = path.dirname(d)) && d != '/') {
        paths.unshift(d);
    }

    for (var i = 0, len = paths.length; i < len; i++) {
        var p = paths[i];
        if (!path.existsSync(p)) {
            fs.mkdirSync(p, mode);
        }
    }
}


function copyFolder(src, dst) {
    if (fs.statSync(src).isDirectory()) {
        mkdir(dst);
        sys.puts("Created directory: " + dst);

        var files = fs.readdirSync(src);
        for (var i = 0, len = files.length; i < len; i++) {
            var file = files[i];
            if (file[0] == '.') {
                // Skip hidden files
                continue;
            }

            var dstFile = path.join(dst, path.basename(file));
            copyFolder(path.join(src, file), dstFile);
        }
    } else {
        sys.pump(fs.createReadStream(src), fs.createWriteStream(dst));
        sys.puts("Copied file: " + dst);
    }
}

exports.description = 'Compile a cocos2d project into a single javascript file';
exports.run = function () {
    opts.parse(OPTIONS, true);

    var config   = opts.get('config') || 'make.json',
        compiler = new Compiler(config),
        output   = opts.get('file')   || compiler.output,
        outputDir = 'build/';

    var code = compiler.make();

    if (output) {
        sys.puts("Writing output to: " + output);

        copyFolder('public', 'build');

        var outputPath = path.join(outputDir, output);
        mkdir(path.dirname(outputPath));
        fs.writeFileSync(outputPath, code, 'utf8');
    } else {
        sys.puts(code);
    }
};
