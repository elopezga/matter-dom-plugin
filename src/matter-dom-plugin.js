var Matter = require('matter-js');
var RenderDom = require('./render/RenderDom.js');
var DomBodies = require('./factory/DomBodies.js');

var MatterDomPlugin = {
    name: 'matter-dom-plugin',
    version: '0.0.1',
    for: 'matter-js@^0.12.0',
    install: function(matter){
        MatterDomPlugin.installRenderDom(matter);
        MatterDomPlugin.installDomBodies(matter);
    },
    installRenderDom: function(matter){
        console.log("Installing RenderDom module.");
        matter.RenderDom = RenderDom(matter);
    },
    installDomBodies: function(matter){
        console.log("Installing DomBodies module.");
        matter.DomBodies = DomBodies(matter);
    }
};


Matter.Plugin.register(MatterDomPlugin);

module.exports.MatterDomPlugin = MatterDomPlugin;