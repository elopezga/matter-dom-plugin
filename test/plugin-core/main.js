(function(){
    Matter.use('matter-dom-plugin');
    
    var Engine = Matter.Engine;
    var Runner = Matter.Runner;
    var RenderDom = Matter.RenderDom;
    var Body = Matter.Body;
    var DomBodies = Matter.DomBodies;
    var MouseConstraint = Matter.MouseConstraint;
    var DomMouseConstraint = Matter.DomMouseConstraint;
    var Mouse = Matter.Mouse;
    var Events = Matter.Events;
    var World = Matter.World;
    var Vector = Matter.Vector;

    var engine = Engine.create();
    var world = engine.world;
    var runner = Runner.create();
    Runner.run(runner, engine);

    
    var render = RenderDom.create({
        engine: engine
    });
    RenderDom.run(render);
    


    var worldWidth = render.mapping.WORLD.width;
    var worldHeight = render.mapping.WORLD.height;
    var worldCenter = render.mapping.WORLD.center;
    var viewHeight = render.mapping.VIEW.height;
    var viewWidth = render.mapping.VIEW.width;
    var viewCenter = render.mapping.VIEW.center;


    /**
     * Add components
     */
    
    var ceiling = DomBodies.create({
        el: '#ceiling',
        render: render,
        position: {x: viewCenter.x, y: 0},
        bodyType: 'block',
        isStatic: true
    });
    var leftWall = DomBodies.create({
        el: '#left-wall',
        render: render,
        position: {x: 0, y: viewCenter.y},
        bodyType: 'block',
        isStatic: true
    });
    var rightWall = DomBodies.create({
        el: '#right-wall',
        render: render,
        position: {x: viewWidth, y: viewCenter.y},
        bodyType: 'block',
        isStatic: true
    });
    var ground = DomBodies.create({
        el: '#ground',
        render: render,
        position: {x: viewCenter.x, y: viewHeight},
        bodyType: 'block',
        isStatic: true
    });

    var ball = DomBodies.create({
        el: '#ball',
        render: render,
        position: {x: viewCenter.x, y: 200},
        bodyType: 'circle',
        restitution: 1,
        friction: 0,
        frictionStatic: 0,
        frictionAir: 0
    });
    
})();