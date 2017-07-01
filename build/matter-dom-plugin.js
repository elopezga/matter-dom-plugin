/*!
 * matter-dom-plugin 0.0.1 by Edgar Lopez-Garci 2017-06-30
 * https://github.com/elopezga/matter-dom-plugin
 * License MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("matter-js"));
	else if(typeof define === 'function' && define.amd)
		define(["matter-js"], factory);
	else if(typeof exports === 'object')
		exports["MatterDomPlugin"] = factory(require("matter-js"));
	else
		root["MatterDomPlugin"] = factory(root["Matter"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/libs";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var DomBodies = {};

module.exports = function (Matter) {
    var Body = Matter.Body;
    var Vertices = Matter.Vertices;
    var Common = Matter.Common;
    var World = Matter.World;
    var Bounds = Matter.Bounds;

    DomBodies.create = function (options) {
        var bodyType = options.bodyType; // Required
        var el = options.el; // Required
        var render = options.render; // Required
        var position = options.position; // Required

        delete options.bodyType;
        delete options.el;
        delete options.render;
        delete options.position;

        var worldBody = null;
        var domBody = document.querySelector(el);

        var positionInWorld = render.mapping.viewToWorld({ x: position.x, y: position.y });
        if (bodyType == "block") {
            var blockDimensionsInWorld = render.mapping.viewToWorld({
                x: domBody.offsetWidth,
                y: domBody.offsetHeight
            });
            //console.log("One block, please!")
            worldBody = DomBodies.block(positionInWorld.x, positionInWorld.y, blockDimensionsInWorld.x, blockDimensionsInWorld.y, options);
        } else if (bodyType == "circle") {
            var circleRadiusInWorld = render.mapping.viewToWorld(domBody.offsetWidth / 2);
            //console.log("One circle, please!");
            worldBody = DomBodies.circle(positionInWorld.x, positionInWorld.y, circleRadiusInWorld, options);
        }

        if (worldBody) {
            domBody.setAttribute('matter-id', worldBody.id);
            World.add(render.engine.world, [worldBody]);
        }

        return worldBody;
    };

    DomBodies.block = function (x, y, width, height, options) {
        var options = options || {};

        var block = {
            label: 'Block Body',
            position: { x: x, y: y },
            vertices: Vertices.fromPath('L 0 0 L ' + width + ' 0 L ' + width + ' ' + height + ' L 0 ' + height)
        };

        if (options.chamfer) {
            var chamfer = option.chamfer;
            block.vertices = Vertices.chamfer(block.vertices, chamfer.radius, chamfer.quality, chamfer.qualityMin, chamfer.qualityMax);
            delete options.chamfer;
        }

        return Body.create(Common.extend({}, block, options));
    };

    DomBodies.circle = function (x, y, radius, options, maxSides) {
        options = options || {};

        var circle = {
            label: 'Circle Body',
            circleRadius: radius

            // approximate circles with polygons until true circles implemented in SAT
        };maxSides = maxSides || 25;
        var sides = Math.ceil(Math.max(10, Math.min(maxSides, radius)));

        // optimisation: always use even number of sides (half the number of unique axes)
        if (sides % 2 === 1) sides += 1;

        return DomBodies.polygon(x, y, sides, radius, Common.extend({}, circle, options));
    };

    DomBodies.polygon = function (x, y, sides, radius, options) {
        options = options || {};

        if (sides < 3) return Bodies.circle(x, y, radius, options);

        var theta = 2 * Math.PI / sides,
            path = '',
            offset = theta * 0.5;

        for (var i = 0; i < sides; i += 1) {
            var angle = offset + i * theta,
                xx = Math.cos(angle) * radius,
                yy = Math.sin(angle) * radius;

            path += 'L ' + xx.toFixed(3) + ' ' + yy.toFixed(3) + ' ';
        }

        var polygon = {
            label: 'Polygon Body',
            position: { x: x, y: y },
            vertices: Vertices.fromPath(path)
        };

        if (options.chamfer) {
            var chamfer = options.chamfer;
            polygon.vertices = Vertices.chamfer(polygon.vertices, chamfer.radius, chamfer.quality, chamfer.qualityMin, chamfer.qualityMax);
            delete options.chamfer;
        }

        return Body.create(Common.extend({}, polygon, options));
    };

    return DomBodies;
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var RenderDom = {};

module.exports = function (Matter) {
    var Common = Matter.Common;
    var Composite = Matter.Composite;
    var Events = Matter.Events;
    var Render = Matter.Render;

    var _requestAnimationFrame, _cancelAnimationFrame;

    if (typeof window !== 'undefined') {
        _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
            window.setTimeout(function () {
                callback(Common.now());
            }, 1000 / 60);
        };

        _cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
    }

    RenderDom.create = function (options) {
        var defaults = {
            engine: null,
            element: window,
            controller: RenderDom,
            frameRequestId: null,
            options: {}

            /*
            try{
                if(!options){
                    throw (new Error('No engine was specified. Create an options object and specify the engine with the engine property.'));
                }
                  if(!options.engine){
                    throw (new Error('No engine was specified. Create an options object and specify the engine with the engine property.'));
                }
            }catch(e){
                console.log(`${e.name}: ${e.message}`);
                return;
            }*/

        };var engine = options.engine;

        var render = Common.extend(defaults, options);

        render.mapping = {};
        render.mapping.ratioMultiplier = 1 / 6; // VIEW is base ratio. Mapping to World.
        render.mapping.VIEW = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        render.mapping.VIEW.center = {
            x: render.mapping.VIEW.width / 2,
            y: render.mapping.VIEW.height / 2
        };
        render.mapping.WORLD = {
            width: render.mapping.VIEW.width * render.mapping.ratioMultiplier,
            height: render.mapping.VIEW.height * render.mapping.ratioMultiplier
        };
        render.mapping.WORLD.center = {
            x: render.mapping.WORLD.width / 2,
            y: render.mapping.WORLD.height / 2
        };
        render.mapping.viewToWorld = function (value) {
            if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value !== null) {
                return {
                    x: render.mapping.ratioMultiplier * value.x,
                    y: render.mapping.ratioMultiplier * value.y
                };
            } else {
                return render.mapping.ratioMultiplier * value;
            }
        };
        render.mapping.worldToView = function (value) {
            if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value !== null) {
                return {
                    x: value.x / render.mapping.ratioMultiplier,
                    y: value.y / render.mapping.ratioMultiplier
                };
            } else {
                return value / render.mapping.ratioMultiplier;
            }
        };

        var debugElement = document.querySelector('#debug');
        debugElement.style.position = "absolute";
        var debugRender = Render.create({
            element: document.querySelector('#debug'),
            engine: engine,
            options: {
                width: render.mapping.WORLD.width,
                height: render.mapping.WORLD.height,
                background: '#fafafa',
                wireframeBackground: '#222',
                hasBounds: false,
                enabled: true,
                wireframes: true,
                showSleeping: true,
                showDebug: false,
                showBroadphase: false,
                showBounds: false,
                showVelocity: false,
                showCollisions: false,
                showAxes: false,
                showPositions: false,
                showAngleIndicator: false,
                showIds: false,
                showShadows: false
            }
        });
        console.log(debugRender);
        Render.run(debugRender);

        render.DebugRender = debugRender;

        return render;
    };

    RenderDom.run = function (render) {
        (function loop(time) {
            render.frameRequestId = _requestAnimationFrame(loop);
            RenderDom.world(render);
        })();
    };

    RenderDom.stop = function (render) {
        _cancelAnimationFrame(render.frameRequestId);
    };

    RenderDom.world = function (render) {
        var engine = render.engine,
            world = engine.world,
            allBodies = Composite.allBodies(world),
            allConstraints = Composite.allConstraints(world),
            domBodies = document.querySelectorAll('[matter]');

        var event = {
            timestamp: engine.timing.timestamp
        };

        Events.trigger(render, 'beforeRender', event);

        // TODO bounds if specified
        RenderDom.bodies(render, domBodies);
    };

    /**
     * Map Dom view elements position to matter world bodys position
     */
    RenderDom.bodies = function (render, bodies, context) {
        var c = context,
            engine = render.engine,
            world = engine.world,
            options = render.options,
            matterBodies = Composite.allBodies(world),
            domBody;

        for (var i = 0; i < bodies.length; i++) {
            domBody = bodies[i];
            var matterBody = null;

            for (var j = 0; j < matterBodies.length; j++) {
                if (domBody.hasAttribute('matter-id') && matterBodies[j].id == domBody.getAttribute('matter-id')) {
                    matterBody = matterBodies[j];
                    break;
                }
            }

            if (!matterBody) {
                continue;
            }

            var bodyWorldPoint = render.mapping.worldToView({ x: matterBody.position.x, y: matterBody.position.y });
            var bodyViewOffset = { x: domBody.offsetWidth / 2, y: domBody.offsetHeight / 2 };
            domBody.style.position = "absolute";
            domBody.style.transform = 'translate(' + (bodyWorldPoint.x - bodyViewOffset.x) + 'px, ' + (bodyWorldPoint.y - bodyViewOffset.y) + 'px)';
            domBody.style.transform += 'rotate(' + matterBody.angle + 'rad)';
        }
    };

    return RenderDom;
};

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Matter = __webpack_require__(2);
var RenderDom = __webpack_require__(1);
var DomBodies = __webpack_require__(0);

var MatterDomPlugin = {
    name: 'matter-dom-plugin',
    version: '0.0.1',
    for: 'matter-js@^0.12.0',
    install: function install(matter) {
        MatterDomPlugin.installRenderDom(matter);
        MatterDomPlugin.installDomBodies(matter);
    },
    installRenderDom: function installRenderDom(matter) {
        console.log("Installing RenderDom module.");
        matter.RenderDom = RenderDom(matter);
    },
    installDomBodies: function installDomBodies(matter) {
        console.log("Install DomBodies module.");
        matter.DomBodies = DomBodies(matter);
    }
};

Matter.Plugin.register(MatterDomPlugin);

module.exports.MatterDomPlugin = MatterDomPlugin;

/***/ })
/******/ ]);
});