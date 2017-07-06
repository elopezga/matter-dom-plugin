var DomBody = {};

module.exports = function(Matter){
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

    DomBody.create = function(options){
        var body = Body.create.apply(null, arguments);
        body.domBounds = null;
        body.domVertices = null;

        _initProperties(body, options);

        return body;
    };

    DomBody.setVertices = function(body, vertices){
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

    DomBody.setPosition = function(body, position){
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

    DomBody.setAngle = function(body, angle){
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

    DomBody.scale = function(body, scaleX, scaleY, point){
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

    DomBody.update = function(body, deltaTime, timeScale, correction){
        var deltaTimeSquared = Math.pow(deltaTime * timeScale * body.timeScale, 2);

        // from the previous step
        var frictionAir = 1 - body.frictionAir * timeScale * body.timeScale,
            velocityPrevX = body.position.x - body.positionPrev.x,
            velocityPrevY = body.position.y - body.positionPrev.y;

        // update velocity with Verlet integration
        body.velocity.x = (velocityPrevX * frictionAir * correction) + (body.force.x / body.mass) * deltaTimeSquared;
        body.velocity.y = (velocityPrevY * frictionAir * correction) + (body.force.y / body.mass) * deltaTimeSquared;

        body.positionPrev.x = body.position.x;
        body.positionPrev.y = body.position.y;
        body.position.x += body.velocity.x;
        body.position.y += body.velocity.y;

        // update angular velocity with Verlet integration
        body.angularVelocity = ((body.angle - body.anglePrev) * frictionAir * correction) + (body.torque / body.inertia) * deltaTimeSquared;
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

    var _initProperties = function(body, options) {
        body.domVertices = generateDomVertices(body);
        body.domBounds = generateDomBounds(body);
    };

    var generateDomVertices = function(body){
        var pointsInDomView = [];
        var renderer = body.domRenderer;
        body.vertices.forEach(function(vertex){
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

    var generateDomBounds = function(body){        
        var domBounds = Bounds.create(body.domVertices);

        return domBounds;
    }

    return DomBody;
};