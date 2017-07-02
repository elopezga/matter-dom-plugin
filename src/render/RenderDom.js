var RenderDom = {};

module.exports = function(Matter){
    var Common = Matter.Common;
    var Composite = Matter.Composite;
    var Events = Matter.Events;
    var Render = Matter.Render;

    var _requestAnimationFrame,
        _cancelAnimationFrame;

    if (typeof window !== 'undefined'){
        _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame
                                    || window.mozRequestAnimationFrame || window.msRequestAnimationFrame
                                    || function(callback){ window.setTimeout(function(){callback(Common.now())}, 1000 / 60);};
        
        _cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame 
                                    || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
    }

    RenderDom.create = function(options){
        var defaults = {
            engine: null,
            element: window,
            controller: RenderDom,
            frameRequestId: null,
            options: {

            }
        }

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

        var engine = options.engine;

        var render = Common.extend(defaults, options);

        render.mapping = {};
        render.mapping.ratioMultiplier = 1/6; // VIEW is base ratio. Mapping to World.
        render.mapping.VIEW = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        render.mapping.VIEW.center = {
            x: render.mapping.VIEW.width/2,
            y: render.mapping.VIEW.height/2
        };
        render.mapping.WORLD = {
            width: render.mapping.VIEW.width * render.mapping.ratioMultiplier,
            height: render.mapping.VIEW.height * render.mapping.ratioMultiplier,
        };
        render.mapping.WORLD.center = {
            x: render.mapping.WORLD.width/2,
            y: render.mapping.WORLD.height/2
        };
        render.mapping.viewToWorld = function(value){
            if( typeof value === 'object' &&  value !== null ){
                return {
                    x: render.mapping.ratioMultiplier * value.x,
                    y: render.mapping.ratioMultiplier * value.y
                };
            }else{
                return render.mapping.ratioMultiplier * value;
            }
        };
        render.mapping.worldToView = function(value){
            if( typeof value === 'object' &&  value !== null ){
                return {
                    x: value.x/render.mapping.ratioMultiplier,
                    y: value.y/render.mapping.ratioMultiplier
                };
            }else{
                return value/render.mapping.ratioMultiplier;
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
    }

    RenderDom.run = function(render){
        (function loop(time){
            render.frameRequestId = _requestAnimationFrame(loop);
            RenderDom.world(render);
        })();
    }

    RenderDom.stop = function(render){
        _cancelAnimationFrame(render.frameRequestId);
    }

    RenderDom.world = function(render){
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
    }

    /**
     * Map Dom view elements position to matter world bodys position
     */
    RenderDom.bodies = function(render, bodies, context){
        var c = context,
            engine = render.engine,
            world = engine.world,
            options = render.options,
            matterBodies = Composite.allBodies(world),
            domBody;

        for(var i=0; i<bodies.length; i++){
            domBody = bodies[i];
            var matterBody = null;

            for(var j=0; j<matterBodies.length; j++){
                if(domBody.hasAttribute('matter-id') && matterBodies[j].id == domBody.getAttribute('matter-id')){
                    matterBody = matterBodies[j];
                    break;
                }
            }

            if(!matterBody){
                continue;
            }

            var bodyWorldPoint = render.mapping.worldToView({x: matterBody.position.x, y: matterBody.position.y});
            var bodyViewOffset = {x: domBody.offsetWidth/2, y: domBody.offsetHeight/2};
            domBody.style.position = "absolute";
            domBody.style.transform = `translate(${bodyWorldPoint.x-bodyViewOffset.x}px, ${bodyWorldPoint.y-bodyViewOffset.y}px)`;
            domBody.style.transform += `rotate(${matterBody.angle}rad)`;
        }
    }

    return RenderDom;
};