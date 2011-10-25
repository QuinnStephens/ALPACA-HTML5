/*globals require module exports process console __dirname*/
/*jslint undef: true, strict: true, white: true, newcap: true, indent: 4 */
"use strict";

var sys = require('sys'),
    opts = require('../opts'),
    path = require('path'),
    Template  = require('../template').Template,
    fs = require('fs');

var SKELETON_PATH = path.join(__dirname, '../skeleton');

var ARGS = [
    {name: 'APP_PATH', required: true}
];


function camelCase(str, upperFirst) {
    if (upperFirst) {
        return str.replace(/(^.|[_\s]+[a-zA-Z])/g, function (s) {
            return s.replace(/[_\s]/g, '').toUpperCase();
        });
    } else {
        return str.replace(/_+[a-zA-Z]/g, function (s) {
            return s.replace(/[_\s]/g, '').toUpperCase();
        });
    }
}
function snakeCase(str) {
    str = str.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2');
    str = str.replace(/([a-z\d])([A-Z])/g, '$1_$2');
    str = str.replace('-', '_');

    return str.toLowerCase();
}
function titleize(str) {
    return str.replace(/(^.|_+[a-zA-Z])/g, function (s) {
        return s.replace(/[_\s]/g, ' ').toUpperCase();
    });
}

function mkdir(dir, mode) {
    mode = mode || 511; // Octal = 0777;
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

exports.description = 'Create a new cocos2d project';
exports.run = function () {
    opts.parse([], ARGS, true);

    var fullPath = path.normalize(path.join(process.cwd(), opts.arg('APP_PATH'))),
        basename = path.basename(fullPath),
        classname = camelCase(basename, true),
        filename = snakeCase(classname),
        appname = titleize(filename);

    mkdir(fullPath);

    sys.puts("Writing new project named '" + classname + "' to: " + fullPath);

    function copyTemplate(src, dst) {
        if (fs.statSync(src).isDirectory()) {
            mkdir(dst);
            sys.puts("Created Directory: " + dst);

            var files = fs.readdirSync(src);
            for (var i = 0, len = files.length; i < len; i++) {
                var file = files[i];
                if (file[0] == '.') {
                    // Skip hidden files
                    continue;
                }

                var dstFile = path.join(dst, path.basename(file));
                copyTemplate(path.join(src, file), dstFile);
            }
        } else {
            var tmp = new Template(fs.readFileSync(src, 'utf8'));
            var data = tmp.substitute({
                appname: appname,
                classname: classname,
                filename: filename,
                basename: basename
            });
            fs.writeFileSync(dst, data, 'utf8');
            sys.puts("Created File: " + dst);
        }
    }

    copyTemplate(SKELETON_PATH, fullPath);
};
