"use strict";(()=>{const e=require("fire-fs"),r=require("fire-path"),a=require("plist");let t={exportParticlePlist:function(t){let i=cc.engine.getInstanceById(t);if(!i)return;let o=this._showDialog();if(!o||-1===o)return;let n=r.join(Editor.Project.path,"assets");if(!(-1!==o.indexOf(n)))return Editor.error(Editor.T("COMPONENT.particle.export_error")),void 0;let l=Editor.url("unpack://static/default-assets/particle/atom.plist"),s=i.file&&i.file.nativeUrl||l,c=a.parse(e.readFileSync(s,"utf8")),d=this._applyPlistData(c,i,o);Editor.Ipc.sendToMain("scene:export-plist",o,a.build(d),function(e,r){e||(Editor.Ipc.sendToPanel("scene","scene:set-property",{id:t,path:"file",type:"cc.ParticleAsset",value:{uuid:r},isSubProp:!1}),Editor.Ipc.sendToPanel("scene","scene:set-property",{id:t,path:"custom",type:"cc.ParticleSystem",value:{custom:!1},isSubProp:!1}))})},_showDialog:function(){return Editor.Dialog.saveFile({title:"Save Particle",defaultPath:Editor.url("db://assets"),filters:[{name:"Particle",extensions:["plist"]}]})},_applyPlistData:function(e,r,a){e.maxParticles=r.totalParticles,e.angle=r.angle,e.angleVariance=r.angleVar,e.duration=r.duration,e.blendFuncSource=r.srcBlendFactor,e.blendFuncDestination=r.dstBlendFactor,e.startColorRed=r.startColor.r/255,e.startColorGreen=r.startColor.g/255,e.startColorBlue=r.startColor.b/255,e.startColorAlpha=r.startColor.a/255,e.startColorVarianceRed=r.startColorVar.r/255,e.startColorVarianceGreen=r.startColorVar.g/255,e.startColorVarianceBlue=r.startColorVar.b/255,e.startColorVarianceAlpha=r.startColorVar.a/255,e.finishColorRed=r.endColor.r/255,e.finishColorGreen=r.endColor.g/255,e.finishColorBlue=r.endColor.b/255,e.finishColorAlpha=r.endColor.a/255,e.finishColorVarianceRed=r.endColorVar.r/255,e.finishColorVarianceGreen=r.endColorVar.g/255,e.finishColorVarianceBlue=r.endColorVar.b/255,e.finishColorVarianceAlpha=r.endColorVar.a/255,e.startParticleSize=r.startSize,e.startParticleSizeVariance=r.startSizeVar,e.finishParticleSize=r.endSize,e.finishParticleSizeVariance=r.endSizeVar,e.sourcePositionVariancex=r.posVar.x,e.sourcePositionVariancey=r.posVar.y,e.rotationStart=r.startSpin,e.rotationStartVariance=r.startSpinVar,e.rotationEnd=r.endSpin,e.rotationEndVariance=r.endSpinVar,e.emitterType=r.emitterMode,e.gravityx=r.gravity.x,e.gravityy=r.gravity.y,e.speed=r.speed,e.speedVariance=r.speedVar,e.radialAcceleration=r.radialAccel,e.radialAccelVariance=r.radialAccelVar,e.tangentialAcceleration=r.tangentialAccel,e.tangentialAccelVariance=r.tangentialAccelVar,e.maxRadius=r.startRadius,e.maxRadiusVariance=r.startRadiusVar,e.minRadius=r.endRadius,e.rotatePerSecond=r.rotatePerS,e.rotatePerSecondVariance=r.rotatePerSVar,e.particleLifespan=r.life,e.particleLifespanVariance=r.lifeVar,e.emissionRate=r.emissionRate;let t=r.spriteFrame;return t&&t._uuid&&(e.spriteFrameUuid=t._uuid,delete e.textureFileName,delete e.textureImageData),e}};module.exports=t})();