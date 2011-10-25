/*globals require module exports process console*/
/*jslint undef: true, strict: true, white: true, newcap: true, indent: 4 */
"use strict";

var sys       = require('sys'),
    http      = require('http'),
    url       = require('url'),
    path      = require('path'),
    fs        = require('fs'),
    opts      = require('../opts'),
    mimetypes = require('../mimetypes'),
    Compiler  = require('./make').Compiler;


var options = [
    {   short: 'u',
        long: 'url',
        description: 'URL to serve the JavaScript as. Default is output defined in the config file',
        value: true },

    {   short: 'c',
        long: 'config',
        description: 'Configuration file. Default is make.json',
        value: true },

    {   short: 'h',
        long: 'host',
        description: 'Hostname or IP address to listen on. Default is localhost',
        value: true },

    {   short: 'p',
        long: 'port',
        description: 'Port to listen on. Default is 4000',
        value: true }
];

exports.description = 'Run the cocos2d development web server';
exports.run = function () {
    opts.parse(options, true);
    var host     = opts.get('host')   || 'localhost',
        port     = opts.get('port')   || 4000,
        config   = opts.get('config') || 'make.json',
        compiler = new Compiler(config),
        output   = opts.get('url')    || compiler.output;

    http.createServer(function (req, res) {
        var uri = url.parse(req.url, true);

        if (uri.pathname == '/') {
            uri.pathname = '/index.html';
        }

        // Serve app code
        if (uri.pathname == '/' + output || uri.pathname == output.replace(/^\/?public/, '')) {
            var code = compiler.make();
            res.writeHead(200, {'Content-Type': 'text/javascript'});
            res.end(code);
        } else {
            var filename = path.join(process.cwd(), 'public', uri.pathname);
            sys.puts("Serving: " + filename);
            if (path.existsSync(filename)) {
                var mimetype = mimetypes.guessType(uri.pathname);
                res.writeHead(200, {'Content-Type': mimetype});
                res.end(fs.readFileSync(filename));
            } else {
                res.writeHead(404, 'File not found');
                res.end('File not found');
            }
        }
    }).listen(parseInt(port, 10), host);

    sys.puts('Point your browser to http://' + host + ':' + port + '/');
};
