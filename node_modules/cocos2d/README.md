Overview
========

Cocos2D JavaScript is an HTML5 port of the popular iPhone 2D graphics engine Cocos2D. It allows rapid development of 2D games and graphical applications which can run in any modern Web browser.

Installation
============

Follow the instructions for your given platform or skip ahead to 'manual
installation' if you want to install from git.

Windows
-------

Download and launch the installer.

<http://cocos2d-javascript.org/downloads>

Linux or Mac OS X using npm
---------------------------

If you have [Node.js][nodejs] and [npm][npm] installed you can install Cocos2D
JavaScript as a package.

    npm install cocos2d

Linux or Mac OS X using ZIP archive
-----------------------------------

If you don't have, or don't want to use npm, you can install by downloading the
latest ZIP.

<http://cocos2d-javascript.org/downloads>

Then from your terminal run `sudo ./install.sh`. The script will copy Cocos2D
JavaScript to a global location of your choice and symlink the executable to
/usr/local/bin/cocos

Manual Installation (all platforms)
-----------------------------------

You don't need to use the installer if you don't want to. You can download the
latest ZIP or checkout the latest version from github. 

If you checkout from github and don't have Node.js installed, be sure to also
get the submodules as they include precompiled Node.js binaries.

    git submodule update --init

With all the code read you can copy it to any place you want and from there use
the 'cocos.sh', 'cocos.bat' or .EXEs in _bin/_ as you would normally.

Creating your first project
===========================

On Windows use the 'Create project' shortcut from your start menu to create and
select a location for your new project.

On Linux and Mac OS X open your terminal and run:

    cocos new ~/my_first_project

This will create a barebones project which simply draws the project name in the
centre of the screen.

To test that it's working, on Windows double click the 'Serve project' shortcut
in your project's folder.

On Linux and Mac OS X from your terminal run:

    cd ~/my_first_project
    cocos server

Now visit http://localhost:4000 and with a bit of luck you'll have something showing.

Developing
==========

Everything you write will be in separate JavaScript files. These will be
compiled into a single file which also includes all your other resources
including images, sound files, map files, etc.

The entry point for the code is the file _src/main.js_ which has an
`exports.main` function that is called on startup.

The HTML for your page is in _public/index.html_.

Compiling your application
==========================

You should never use the development server in production. It's very slow and
insecure. Instead you will compile your application into a single JavaScript
file. This file includes everything, you don't need to worry about hosting any
external resources such as images and tilemaps.

To do this, on Windows double click the 'Compile project' shortcut in your
project's folder.

On Linux and Mac OS X in your terminal run:

    cd ~/my_first_project
    cocos make

The file will be written to _build/_. You can run this through a JavaScript
minifier if you so choose. You will get a very good reduction in size if your
Web server is configured to gzip JavaScript files.

Browser Support
===============

Everything should work in Firefox 3, Chrome, Safari, Opera and IE9. If that is
not the case then please file a bug report.

Documentation
=============

Documentation can be viewed online at <http://cocos2d-javascript.org/documentation>

If you wish to generate the documentation yourself you need to follow these steps.

Download JsDoc 2.3 (or 2.4) from <http://code.google.com/p/jsdoc-toolkit/>.

Copy that to /usr/local/jsdoc-toolkit or wherever you like and then run:
    
    JSDOC_HOME=/usr/local/jsdoc-toolkit ./bin/jsdoc

The documentation will appear in the 'docs' directory.

License
=======

Cocos2D JavaScript is released under the MIT license. See LICENSE for more details.

© 2010-2011 Ryan Williams <ryan@cocos2d-javascript.org>

Links
=====

* Twitter: [@cocos2djs](http://twitter.com/cocos2djs)
* Website: <http://cocos2d-javascript.org/>
* Documentation: <http://cocos2d-javascript.org/documentation>
* Forum: <http://cocos2d-javascript.org/forum>
* Email: <ryan@cocos2d-javascript.org>


[nodejs]: http://nodejs.org
[npm]: http://npmjs.org
