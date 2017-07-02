module.exports = function(Matter){


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

    Engine.update = function(engine, delta, correction){
        superUpdate(engine, delta, correction);
        
        delta = delta || 1000 / 60;
        correction = correction || 1;

        var world = engine.world;
        var timing = engine.timing;
        var allBodies = Composite.allBodies(world);


        _bodiesUpdate(allBodies, delta, timing.timeScale, correction, world.bounds);
        return engine;
    }

    var _bodiesUpdate = function(bodies, deltaTime, timeScale, correction, worldBounds) {
        for (var i = 0; i < bodies.length; i++) {
            var body = bodies[i];

            if (body.isStatic || body.isSleeping)
                continue;

            DomBody.update(body, deltaTime, timeScale, correction);
        }
    };
};