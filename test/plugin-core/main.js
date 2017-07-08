(function(){
    Matter.use('matter-collision-events');
    Matter.use('matter-dom-plugin');
    console.log(Matter);
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
    var Vertices = Matter.Vertices;
    var Bounds = Matter.Bounds;

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
        Dom: {
            render: render,
            element: document.querySelector('#ball')
        },
        el: '#ceiling',
        render: render,
        position: {x: viewCenter.x, y: 0},
        bodyType: 'block',
        isStatic: true
    });
    var leftWall = DomBodies.create({
        Dom: {
            render: render,
            element: document.querySelector('#ball')
        },
        el: '#left-wall',
        render: render,
        position: {x: 0, y: viewCenter.y},
        bodyType: 'block',
        isStatic: true
    });
    var rightWall = DomBodies.create({
        Dom: {
            render: render,
            element: document.querySelector('#ball')
        },
        el: '#right-wall',
        render: render,
        position: {x: viewWidth, y: viewCenter.y},
        bodyType: 'block',
        isStatic: true
    });
    var ground = DomBodies.create({
        Dom: {
            render: render,
            element: document.querySelector('#ball')
        },
        el: '#ground',
        render: render,
        position: {x: viewCenter.x, y: viewHeight},
        bodyType: 'block',
        isStatic: true
    });
    

    var ball = DomBodies.create({
        Dom: {
            render: render,
            element: document.querySelector('#ball')
        },
        el: '#ball',
        render: render,
        position: {x: viewCenter.x, y: 200},
        bodyType: 'circle',
        restitution: 0.9,
        friction: 0.2,
        frictionStatic: 0.0,
        frictionAir: 0
    });


    console.log("yo wassup");
    console.log(ball);

    // Mouse control
    var mouse = Mouse.create(document.body);
    var MouseConstraint = DomMouseConstraint.create(engine,{
        mouse: mouse,
        constraint: {
            stiffness: 0.1,
            render: {
                visible: false
            }
        }
    });
    World.add(world, MouseConstraint);
    
})();