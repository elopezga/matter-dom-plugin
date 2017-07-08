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

        //body.Dom.element.setAttribute('matter-id', body.id);
        return body;
    };

    DomBody.setVertices = function(body, vertices){
        Body.setVertices.apply(null, arguments);
    };

    DomBody.setPosition = function(body, position){
        Body.setPosition.apply(null, arguments);
    };

    DomBody.setAngle = function(body, angle){
        Body.setAngle.apply(null, arguments);
    };

    DomBody.scale = function(body, scaleX, scaleY, point){
        Body.scale.apply(null, arguments);
    };

    DomBody.update = function(body, deltaTime, timeScale, correction){
        Body.update.apply(null, arguments);
    };

    return DomBody;
};