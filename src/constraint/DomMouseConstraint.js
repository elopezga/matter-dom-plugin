var DomMouseConstraint = {};

module.exports = function(Matter){
    var Vertices = Matter.Vertices;
    var Sleeping = Matter.Sleeping;
    var Mouse = Matter.Mouse;
    var Events = Matter.Events;
    var Detector = Matter.Detector;
    var Constraint = Matter.Constraint;
    var Composite = Matter.Composite;
    var Common = Matter.Common;
    var Bounds = Matter.Bounds;

    DomMouseConstraint.create = function(engine, options){
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

        
        Events.on(engine, 'beforeUpdate', function() {
            var allBodies = Composite.allBodies(engine.world);
            DomMouseConstraint.update(domMouseConstraint, allBodies);
            _triggerEvents(domMouseConstraint);
        });

        return domMouseConstraint;
    };

    DomMouseConstraint.update = function(mouseConstraint, bodies){
        var mouse = mouseConstraint.mouse,
            constraint = mouseConstraint.constraint,
            body = mouseConstraint.body;

        var mousePositionInWorld;
        if(mouse.button === 0){
            if(!constraint.bodyB){
                var allDomBodies = document.querySelectorAll('[matter]');
                for(var i=0; i<bodies.length; i++){
                    body = bodies[i];

                    mousePositionInWorld = body.domRenderer.mapping.viewToWorld(mouse.position);
                    var bodyPositionInView = body.domRenderer.mapping.worldToView(body.position);
                    if(Bounds.contains(body.bounds, mousePositionInWorld)){
                        constraint.pointA =  mousePositionInWorld;
                        constraint.bodyB = mouseConstraint.body = body;
                        //constraint.pointB = {x: mousePositionInWorld.x - body.position.x, y: mousePositionInWorld.y - body.position.y};
                        constraint.pointB = {x: 0, y: 0};
                        constraint.angleB = body.angle;

                        break;
                    }   
                }
            }else{

                Sleeping.set(constraint.bodyB, false);
                mousePositionInWorld = body.domRenderer.mapping.viewToWorld(mouse.position);
                constraint.pointA = mousePositionInWorld;
            }
        }else{
            constraint.bodyB = mouseConstraint.body = null;
            constraint.pointB = null;

            if (body)
                Events.trigger(mouseConstraint, 'enddrag', { mouse: mouse, body: body });
        }
    };

    var _triggerEvents = function(mouseConstraint) {
        var mouse = mouseConstraint.mouse,
            mouseEvents = mouse.sourceEvents;

        if (mouseEvents.mousemove)
            Events.trigger(mouseConstraint, 'mousemove', { mouse: mouse });

        if (mouseEvents.mousedown)
            Events.trigger(mouseConstraint, 'mousedown', { mouse: mouse });

        if (mouseEvents.mouseup)
            Events.trigger(mouseConstraint, 'mouseup', { mouse: mouse });

        // reset the mouse state ready for the next step
        Mouse.clearSourceEvents(mouse);
    };


    return DomMouseConstraint;
}