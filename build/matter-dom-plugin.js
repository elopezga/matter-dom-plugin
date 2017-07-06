/*!
 * matter-dom-plugin 0.1.1 by Edgar Lopez-Garci 2017-07-06
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
})(this, function(__WEBPACK_EXTERNAL_MODULE_5__) {
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
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var DomBody = {};

module.exports = function (Matter) {
    var Vertices = Matter.Vertices;
    var Vector = Matter.Vector;
    var Sleeping = Matter.Sleeping;
    var Render = Matter.Render;
    var Common = Matter.Common;
    var Bounds = Matter.Bounds;
    var Axes = Matter.Axes;
    var Body = Matter.Body;
    var Events = Matter.Events;

    // Extend Body
    DomBody = Common.clone(Body, true);

    DomBody.create = function (options) {
        var body = Body.create.apply(null, arguments);
        body.domBounds = null;
        body.domVertices = null;

        _initProperties(body, options);

        return body;
    };

    DomBody.setVertices = function (body, vertices) {
        // change vertices
        if (vertices[0].body === body) {
            body.vertices = vertices;
        } else {
            body.vertices = Vertices.create(vertices, body);
        }

        // update properties
        body.axes = Axes.fromVertices(body.vertices);
        body.area = Vertices.area(body.vertices);
        Body.setMass(body, body.density * body.area);

        // orient vertices around the centre of mass at origin (0, 0)
        var centre = Vertices.centre(body.vertices);
        Vertices.translate(body.vertices, centre, -1);

        // update inertia while vertices are at origin (0, 0)
        Body.setInertia(body, Body._inertiaScale * Vertices.inertia(body.vertices, body.mass));

        // update geometry
        Vertices.translate(body.vertices, body.position);
        Bounds.update(body.bounds, body.vertices, body.velocity);
        //Bounds.update(body.domBounds, body.vertices, body.velocity);
        body.domVertices = generateDomVertices(body);
        body.domBounds = generateDomBounds(body);
    };

    DomBody.setPosition = function (body, position) {
        var delta = Vector.sub(position, body.position);
        body.positionPrev.x += delta.x;
        body.positionPrev.y += delta.y;

        for (var i = 0; i < body.parts.length; i++) {
            var part = body.parts[i];
            part.position.x += delta.x;
            part.position.y += delta.y;
            Vertices.translate(part.vertices, delta);
            Bounds.update(part.bounds, part.vertices, body.velocity);
            //Bounds.update(part.domBounds, part.vertices, body.velocity);
            body.domVertices = generateDomVertices(body);
            body.domBounds = generateDomBounds(body);
        }
    };

    DomBody.setAngle = function (body, angle) {
        var delta = angle - body.angle;
        body.anglePrev += delta;

        for (var i = 0; i < body.parts.length; i++) {
            var part = body.parts[i];
            part.angle += delta;
            Vertices.rotate(part.vertices, delta, body.position);
            Axes.rotate(part.axes, delta);
            Bounds.update(part.bounds, part.vertices, body.velocity);
            //Bounds.update(part.domBounds, part.vertices, body.velocity);
            body.domVertices = generateDomVertices(body);
            body.domBounds = generateDomBounds(body);
            if (i > 0) {
                Vector.rotateAbout(part.position, delta, body.position, part.position);
            }
        }
    };

    DomBody.scale = function (body, scaleX, scaleY, point) {
        for (var i = 0; i < body.parts.length; i++) {
            var part = body.parts[i];

            // scale vertices
            Vertices.scale(part.vertices, scaleX, scaleY, body.position);

            // update properties
            part.axes = Axes.fromVertices(part.vertices);

            if (!body.isStatic) {
                part.area = Vertices.area(part.vertices);
                Body.setMass(part, body.density * part.area);

                // update inertia (requires vertices to be at origin)
                Vertices.translate(part.vertices, { x: -part.position.x, y: -part.position.y });
                Body.setInertia(part, Vertices.inertia(part.vertices, part.mass));
                Vertices.translate(part.vertices, { x: part.position.x, y: part.position.y });
            }

            // update bounds
            Bounds.update(part.bounds, part.vertices, body.velocity);
            //Bounds.update(part.domBounds, part.vertices, body.velocity);
            body.domVertices = generateDomVertices(body);
            body.domBounds = generateDomBounds(body);
        }

        // handle circles
        if (body.circleRadius) {
            if (scaleX === scaleY) {
                body.circleRadius *= scaleX;
            } else {
                // body is no longer a circle
                body.circleRadius = null;
            }
        }

        if (!body.isStatic) {
            var total = _totalProperties(body);
            body.area = total.area;
            Body.setMass(body, total.mass);
            Body.setInertia(body, total.inertia);
        }
    };

    DomBody.update = function (body, deltaTime, timeScale, correction) {
        var deltaTimeSquared = Math.pow(deltaTime * timeScale * body.timeScale, 2);

        // from the previous step
        var frictionAir = 1 - body.frictionAir * timeScale * body.timeScale,
            velocityPrevX = body.position.x - body.positionPrev.x,
            velocityPrevY = body.position.y - body.positionPrev.y;

        // update velocity with Verlet integration
        body.velocity.x = velocityPrevX * frictionAir * correction + body.force.x / body.mass * deltaTimeSquared;
        body.velocity.y = velocityPrevY * frictionAir * correction + body.force.y / body.mass * deltaTimeSquared;

        body.positionPrev.x = body.position.x;
        body.positionPrev.y = body.position.y;
        body.position.x += body.velocity.x;
        body.position.y += body.velocity.y;

        // update angular velocity with Verlet integration
        body.angularVelocity = (body.angle - body.anglePrev) * frictionAir * correction + body.torque / body.inertia * deltaTimeSquared;
        body.anglePrev = body.angle;
        body.angle += body.angularVelocity;

        // track speed and acceleration
        body.speed = Vector.magnitude(body.velocity);
        body.angularSpeed = Math.abs(body.angularVelocity);

        // transform the body geometry
        for (var i = 0; i < body.parts.length; i++) {
            var part = body.parts[i];

            Vertices.translate(part.vertices, body.velocity);

            if (i > 0) {
                part.position.x += body.velocity.x;
                part.position.y += body.velocity.y;
            }

            if (body.angularVelocity !== 0) {
                Vertices.rotate(part.vertices, body.angularVelocity, body.position);
                Axes.rotate(part.axes, body.angularVelocity);
                if (i > 0) {
                    Vector.rotateAbout(part.position, body.angularVelocity, body.position, part.position);
                }
            }

            Bounds.update(part.bounds, part.vertices, body.velocity);
            //Bounds.update(part.domBounds, part.vertices, body.velocity);
            body.domVertices = generateDomVertices(body);
            body.domBounds = generateDomBounds(body);
        }
    };

    var _initProperties = function _initProperties(body, options) {
        body.domVertices = generateDomVertices(body);
        body.domBounds = generateDomBounds(body);
    };

    var generateDomVertices = function generateDomVertices(body) {
        var pointsInDomView = [];
        var renderer = body.domRenderer;
        body.vertices.forEach(function (vertex) {
            var pointInDomView = renderer.mapping.worldToView({
                x: vertex.x,
                y: vertex.y
            });
            var vectorInDomView = Vector.create(pointInDomView.x, pointInDomView.y);
            pointsInDomView.push(vectorInDomView);
        });
        var verticesInView = Vertices.create(pointsInDomView, body);

        return verticesInView;
    };

    var generateDomBounds = function generateDomBounds(body) {
        var domBounds = Bounds.create(body.domVertices);

        return domBounds;
    };

    return DomBody;
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var DomMouseConstraint = {};

module.exports = function (Matter) {
    var Vertices = Matter.Vertices;
    var Sleeping = Matter.Sleeping;
    var Mouse = Matter.Mouse;
    var Events = Matter.Events;
    var Detector = Matter.Detector;
    var Constraint = Matter.Constraint;
    var Composite = Matter.Composite;
    var Common = Matter.Common;
    var Bounds = Matter.Bounds;

    DomMouseConstraint.create = function (engine, options) {
        var mouse = (engine ? engine.mouse : null) || (options ? options.mouse : null);

        if (!mouse) {
            if (engine && engine.render && engine.render.canvas) {
                mouse = Mouse.create(engine.render.canvas);
            } else if (options && options.element) {
                mouse = Mouse.create(options.element);
            } else {
                mouse = Mouse.create();
                Common.warn('MouseConstraint.create: options.mouse was undefined, options.element was undefined, may not function as expected');
            }
        }

        var constraint = Constraint.create({
            label: 'Mouse Constraint',
            pointA: mouse.position,
            pointB: { x: 0, y: 0 },
            length: 0.01,
            stiffness: 0.1,
            angularStiffness: 1,
            render: {
                strokeStyle: '#90EE90',
                lineWidth: 3
            }
        });

        var defaults = {
            type: 'mouseConstraint',
            mouse: mouse,
            element: null,
            body: null,
            constraint: constraint,
            collisionFilter: {
                category: 0x0001,
                mask: 0xFFFFFFFF,
                group: 0
            }
        };

        var domMouseConstraint = Common.extend(defaults, options);

        Events.on(engine, 'beforeUpdate', function () {
            var allBodies = Composite.allBodies(engine.world);
            DomMouseConstraint.update(domMouseConstraint, allBodies);
            _triggerEvents(domMouseConstraint);
        });

        return domMouseConstraint;
    };

    DomMouseConstraint.update = function (mouseConstraint, bodies) {
        var mouse = mouseConstraint.mouse,
            constraint = mouseConstraint.constraint,
            body = mouseConstraint.body;

        var mousePositionInWorld;
        if (mouse.button === 0) {
            if (!constraint.bodyB) {
                var allDomBodies = document.querySelectorAll('[matter]');
                for (var i = 0; i < bodies.length; i++) {
                    body = bodies[i];

                    mousePositionInWorld = body.domRenderer.mapping.viewToWorld(mouse.position);
                    var bodyPositionInView = body.domRenderer.mapping.worldToView(body.position);
                    if (Bounds.contains(body.bounds, mousePositionInWorld)) {
                        constraint.pointA = mousePositionInWorld;
                        constraint.bodyB = mouseConstraint.body = body;
                        //constraint.pointB = {x: mousePositionInWorld.x - body.position.x, y: mousePositionInWorld.y - body.position.y};
                        constraint.pointB = { x: 0, y: 0 };
                        constraint.angleB = body.angle;

                        break;
                    }
                }
            } else {

                Sleeping.set(constraint.bodyB, false);
                mousePositionInWorld = body.domRenderer.mapping.viewToWorld(mouse.position);
                constraint.pointA = mousePositionInWorld;
            }
        } else {
            constraint.bodyB = mouseConstraint.body = null;
            constraint.pointB = null;

            if (body) Events.trigger(mouseConstraint, 'enddrag', { mouse: mouse, body: body });
        }
    };

    var _triggerEvents = function _triggerEvents(mouseConstraint) {
        var mouse = mouseConstraint.mouse,
            mouseEvents = mouse.sourceEvents;

        if (mouseEvents.mousemove) Events.trigger(mouseConstraint, 'mousemove', { mouse: mouse });

        if (mouseEvents.mousedown) Events.trigger(mouseConstraint, 'mousedown', { mouse: mouse });

        if (mouseEvents.mouseup) Events.trigger(mouseConstraint, 'mouseup', { mouse: mouse });

        // reset the mouse state ready for the next step
        Mouse.clearSourceEvents(mouse);
    };

    return DomMouseConstraint;
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (Matter) {

    // Patch Engine
    var World = Matter.World;
    var Sleeping = Matter.Sleeping;
    var Resolver = Matter.Resolver;
    var Render = Matter.Render;
    var Pairs = Matter.Pair;
    var Metrics = Matter.Metrics;
    var Grid = Matter.Grid;
    var Events = Matter.Events;
    var Composite = Matter.Composite;
    var Constraint = Matter.Constraint;
    var Common = Matter.Common;
    var Body = Matter.Body;
    var DomBody = Matter.DomBody;
    var Engine = Matter.Engine;

    var superUpdate = Engine.update;

    Engine.update = function (engine, delta, correction) {
        superUpdate(engine, delta, correction);

        delta = delta || 1000 / 60;
        correction = correction || 1;

        var world = engine.world;
        var timing = engine.timing;
        var allBodies = Composite.allBodies(world);

        _bodiesUpdate(allBodies, delta, timing.timeScale, correction, world.bounds);
        return engine;
    };

    var _bodiesUpdate = function _bodiesUpdate(bodies, deltaTime, timeScale, correction, worldBounds) {
        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            if (body.isStatic || body.isSleeping) continue;

            DomBody.update(body, deltaTime, timeScale, correction);
        }
    };
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var DomBodies = {};

module.exports = function (Matter) {
    var Body = Matter.Body;
    var DomBody = Matter.DomBody;
    var Vertices = Matter.Vertices;
    var Common = Matter.Common;
    var World = Matter.World;
    var Bounds = Matter.Bounds;
    var Vector = Matter.Vector;

    DomBodies.create = function (options) {
        var bodyType = options.bodyType; // Required
        var el = options.el; // Required
        var render = options.render; // Required
        var position = options.position; // Required

        delete options.bodyType;
        //delete options.el;
        delete options.render;
        delete options.position;

        options.domRenderer = render;

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
            /*
            var verticesPointsInView = [];
            worldBody.vertices.forEach(function(vertex){
                var point = render.mapping.worldToView({
                    x: vertex.x,
                    y: vertex.y
                });
                var vector = Vector.create(point.x, point.y);
                verticesPointsInView.push(vector);
            });
            var verticesInView = Vertices.create(verticesPointsInView, worldBody);
              worldBody.domBounds = Bounds.create(verticesInView);
            */

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
        return DomBody.create(Common.extend({}, block, options));
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

        return DomBody.create(Common.extend({}, polygon, options));
    };

    return DomBodies;
};

/***/ }),
/* 4 */
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
/* 5 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Matter = __webpack_require__(5);
var RenderDom = __webpack_require__(4);
var DomBody = __webpack_require__(0);
var DomBodies = __webpack_require__(3);
var DomMouseConstraint = __webpack_require__(1);
var Engine = __webpack_require__(2);

var MatterDomPlugin = {
    name: 'matter-dom-plugin',
    version: '0.1.1',
    for: 'matter-js@^0.12.0',
    install: function install(matter) {
        MatterDomPlugin.installRenderDom(matter);
        MatterDomPlugin.installDomBody(matter);
        MatterDomPlugin.installDomBodies(matter); // Depends on DomBody
        MatterDomPlugin.installDomMouseConstraint(matter);
        MatterDomPlugin.installEngine(matter);
    },
    installRenderDom: function installRenderDom(matter) {
        console.log("Installing RenderDom module.");
        matter.RenderDom = RenderDom(matter);
    },
    installDomBodies: function installDomBodies(matter) {
        console.log("Installing DomBodies module.");
        matter.DomBodies = DomBodies(matter);
    },
    installDomMouseConstraint: function installDomMouseConstraint(matter) {
        console.log("Installing DomMouseConstraint.");
        matter.DomMouseConstraint = DomMouseConstraint(matter);
    },
    installDomBody: function installDomBody(matter) {
        console.log("Installing DomBody updates.");
        matter.DomBody = DomBody(matter);
    },
    installEngine: function installEngine(matter) {
        console.log("Patching Engine.");
        Engine(matter);
    }
};

Matter.Plugin.register(MatterDomPlugin);

module.exports.MatterDomPlugin = MatterDomPlugin;

/***/ })
/******/ ]);
});