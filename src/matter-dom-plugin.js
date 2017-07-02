var Matter = require('matter-js');
var RenderDom = require('./render/RenderDom.js');
var DomBody = require('./body/DomBody.js');
var DomBodies = require('./factory/DomBodies.js');
var DomMouseConstraint = require('./constraint/DomMouseConstraint.js');
var Engine = require('./core/Engine.js');

var MatterDomPlugin = {
    name: 'matter-dom-plugin',
    version: '0.0.1',
    for: 'matter-js@^0.12.0',
    install: function(matter){
        MatterDomPlugin.installRenderDom(matter);
        MatterDomPlugin.installDomBody(matter);
        MatterDomPlugin.installDomBodies(matter); // Depends on DomBody
        MatterDomPlugin.installDomMouseConstraint(matter);
        MatterDomPlugin.installEngine(matter);
    },
    installRenderDom: function(matter){
        console.log("Installing RenderDom module.");
        matter.RenderDom = RenderDom(matter);
    },
    installDomBodies: function(matter){
        console.log("Installing DomBodies module.");
        matter.DomBodies = DomBodies(matter);
    },
    installDomMouseConstraint: function(matter){
        console.log("Installing DomMouseConstraint.");
        matter.DomMouseConstraint = DomMouseConstraint(matter);
    },
    installDomBody: function(matter){
        console.log("Installing DomBody updates.");
        matter.DomBody = DomBody(matter);
    },
    installEngine: function(matter){
        console.log("Patching Engine.");
        Engine(matter);
    }
};


Matter.Plugin.register(MatterDomPlugin);

module.exports.MatterDomPlugin = MatterDomPlugin;