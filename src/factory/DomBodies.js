var DomBodies = {};

module.exports = function(Matter){
    var Body = Matter.Body;
    var DomBody = Matter.DomBody;
    var Vertices = Matter.Vertices;
    var Common = Matter.Common;
    var World = Matter.World;
    var Bounds = Matter.Bounds;
    var Vector = Matter.Vector;

    DomBodies.create = function(options){
        var bodyType = options.bodyType; // Required
        var el = options.el; // Required
        var render = options.render; // Required
        var position = options.position; // Required

        delete options.bodyType;
        //delete options.el;
        delete options.render;
        delete options.position;

        options.domRenderer = render;

        var worldBody = null
        var domBody = document.querySelector(el);

        var positionInWorld = render.mapping.viewToWorld({x: position.x, y: position.y});        
        if(bodyType == "block"){
            var blockDimensionsInWorld = render.mapping.viewToWorld({
                x: domBody.offsetWidth,
                y: domBody.offsetHeight  
            });
            //console.log("One block, please!")
            worldBody = DomBodies.block(
                positionInWorld.x,
                positionInWorld.y,
                blockDimensionsInWorld.x,
                blockDimensionsInWorld.y,
                options
            );
        }else if(bodyType == "circle"){
            var circleRadiusInWorld = render.mapping.viewToWorld(domBody.offsetWidth/2);
            //console.log("One circle, please!");
            worldBody = DomBodies.circle(
                positionInWorld.x,
                positionInWorld.y,
                circleRadiusInWorld,
                options
            );
        }

        if(worldBody){
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
    }

    DomBodies.block = function(x, y, width, height, options){
        var options = options || {};

        var block = {
            label: 'Block Body',
            position: {x: x, y: y},
            vertices: Vertices.fromPath('L 0 0 L ' + width + ' 0 L ' + width + ' ' + height + ' L 0 ' + height)
        };

        if(options.chamfer){
            var chamfer = option.chamfer;
            block.vertices = Vertices.chamfer(block.vertices, chamfer.radius,
                                chamfer.quality, chamfer.qualityMin, chamfer.qualityMax);
            delete options.chamfer;
        }
        return DomBody.create(Common.extend({}, block, options));
    };

    DomBodies.circle = function(x, y, radius, options, maxSides){
        options = options || {};

        var circle = {
            label: 'Circle Body',
            circleRadius: radius
        }

        // approximate circles with polygons until true circles implemented in SAT
        maxSides = maxSides || 25;
        var sides = Math.ceil(Math.max(10, Math.min(maxSides, radius)));

        // optimisation: always use even number of sides (half the number of unique axes)
        if(sides % 2 === 1)
            sides += 1;

        return DomBodies.polygon(x, y, sides, radius, Common.extend({}, circle, options));
    };

    DomBodies.polygon = function(x, y, sides, radius, options){
        options = options || {};

        if (sides < 3)
            return Bodies.circle(x, y, radius, options);

        var theta = 2 * Math.PI / sides,
            path = '',
            offset = theta * 0.5;

        for (var i = 0; i < sides; i += 1) {
            var angle = offset + (i * theta),
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
            polygon.vertices = Vertices.chamfer(polygon.vertices, chamfer.radius, 
                                    chamfer.quality, chamfer.qualityMin, chamfer.qualityMax);
            delete options.chamfer;
        }

        return DomBody.create(Common.extend({}, polygon, options));
    }

    return DomBodies;
};