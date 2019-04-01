"use strict";const t=require("numeral"),i=require("pixi.js"),e=require("./linear-ticks");function s(t){return Math.floor(t)}function h(t,i){return i=(i-=t)||1/i,function(e){return(e-t)/i}}function l(t,i){return function(e){return t*(1-e)+i*e}}i.utils._saidHello=!0;module.exports=class extends window.HTMLElement{constructor(){super(),this.canvas={element:document.createElement("canvas"),width:0,height:0},this.label={vElement:document.createElement("div"),vLabels:[],hElement:document.createElement("div"),hLabels:[]},this.hticks=null,this.xAxisScale=1,this.xAxisOffset=0,this.xAnchor=.5,this.vticks=null,this.yAxisScale=1,this.yAxisOffset=0,this.yAnchor=.5,this.renderer=null,this.stage=null,this.bgGraphics=null,this.attachShadow({mode:"open"});let t=document.createElement("style");t.type="text/css",t.textContent=require("fs").readFileSync(require("path").join(__dirname,"./grid.css"),"utf-8"),this.shadowRoot.appendChild(t),this.shadowRoot.appendChild(this.canvas.element),this.label.vElement.className="vLabels",this.shadowRoot.appendChild(this.label.vElement),this.label.hElement.className="hLabels",this.shadowRoot.appendChild(this.label.hElement),this._xAnchorOffset=0,this._yAnchorOffset=0}connectedCallback(){let t=this.canvas.element.getBoundingClientRect();this.renderer=new i.WebGLRenderer(t.width,t.height,{view:this.canvas.element,transparent:!0,antialias:!1,forceFXAA:!1}),this.stage=new i.Container;let e=new i.Container;this.stage.addChild(e),this.bgGraphics=new i.Graphics,e.addChild(this.bgGraphics)}static get observedAttributes(){return["show-label-h","show-label-v"]}attributeChangedCallback(t,i,e){switch(t){case"show-label-h":case"show-label-v":this._updateLabel()}}setAnchor(t,i){this.xAnchor=Editor.Math.clamp(t,-1,1),this.yAnchor=Editor.Math.clamp(i,-1,1)}setScaleH(t,i,s,h,l){this.hticks=(new e).initTicks(t,i,s).spacing(10,80),this.xAxisScale=Editor.Math.clamp(this.xAxisScale,this.hticks.minValueScale,this.hticks.maxValueScale),"frame"===h&&(this.hformat=(t=>Editor.Utils.formatFrame(t,l||60))),this.pixelToValueH=(t=>(t-this.xAxisOffset)/this.xAxisScale),this.valueToPixelH=(t=>t*this.xAxisScale+this.xAxisOffset)}setMappingH(t,i,e){this._xAnchorOffset=t/(i-t),this.xDirection=i-t>0?1:-1,this.pixelToValueH=(s=>{let a=this.xAxisOffset,n=this.canvas.width/e,c=h(0,this.canvas.width);return l(t*n,i*n)(c(s-a))/this.xAxisScale}),this.valueToPixelH=(s=>{let a=this.xAxisOffset,n=this.canvas.width/e,c=h(t*n,i*n);return l(0,this.canvas.width)(c(s*this.xAxisScale))+a})}setScaleV(t,i,s,h){this.vticks=(new e).initTicks(t,i,s).spacing(10,80),this.yAxisScale=Editor.Math.clamp(this.yAxisScale,this.vticks.minValueScale,this.vticks.maxValueScale),"frame"===h&&(this.vformat=(t=>Editor.Utils.formatFrame(t,60))),this.pixelToValueV=(t=>(this.canvas.height-t+this.yAxisOffset)/this.yAxisScale),this.valueToPixelV=(t=>-t*this.yAxisScale+this.canvas.height+this.yAxisOffset)}setMappingV(t,i,e){this._yAnchorOffset=t/(i-t),this.yDirection=i-t>0?1:-1,this.pixelToValueV=(s=>{let a=this.yAxisOffset,n=this.canvas.height/e,c=h(0,this.canvas.height);return l(t*n,i*n)(c(s-a))/this.yAxisScale}),this.valueToPixelV=(s=>{let a=this.yAxisOffset,n=this.canvas.height/e,c=h(t*n,i*n);return l(0,this.canvas.height)(c(s*this.yAxisScale))+a})}pan(t,i){this.panX(t),this.panY(i)}panX(t){if(!this.valueToPixelH)return;let i,e,s=this.xAxisOffset+t;return this.xAxisOffset=0,s>=10&&(s=10),void 0!==this.xMinRange&&null!==this.xMinRange&&(i=this.valueToPixelH(this.xMinRange)),void 0!==this.xMaxRange&&null!==this.xMaxRange&&(e=this.valueToPixelH(this.xMaxRange),e=Math.max(0,e-this.canvas.width)),this.xAxisOffset=s,void 0!==i&&void 0!==e?(this.xAxisOffset=Editor.Math.clamp(this.xAxisOffset,-e,-i),void 0):void 0!==i?(this.xAxisOffset=Math.min(this.xAxisOffset,-i),void 0):void 0!==e?(this.xAxisOffset=Math.max(this.xAxisOffset,-e),void 0):void 0}panY(t){if(!this.valueToPixelV)return;let i,e,s=this.yAxisOffset+t;return this.yAxisOffset=0,void 0!==this.yMinRange&&null!==this.yMinRange&&(i=this.valueToPixelV(this.yMinRange)),void 0!==this.yMaxRange&&null!==this.yMaxRange&&(e=this.valueToPixelV(this.yMaxRange),e=Math.max(0,e-this.canvas.height)),this.yAxisOffset=s,void 0!==i&&void 0!==e?(this.yAxisOffset=Editor.Math.clamp(this.yAxisOffset,-e,-i),void 0):void 0!==i?(this.yAxisOffset=Math.min(this.yAxisOffset,-i),void 0):void 0!==e?(this.yAxisOffset=Math.max(this.yAxisOffset,-e),void 0):void 0}xAxisScaleAt(t,i){let e=this.pixelToValueH(t);this.xAxisScale=Editor.Math.clamp(i,this.hticks.minValueScale,this.hticks.maxValueScale);let s=this.valueToPixelH(e);this.pan(t-s,0)}yAxisScaleAt(t,i){let e=this.pixelToValueV(t);this.yAxisScale=Editor.Math.clamp(i,this.vticks.minValueScale,this.vticks.maxValueScale);let s=this.valueToPixelV(e);this.pan(0,t-s)}xAxisSync(t,i){this.xAxisOffset=t,this.xAxisScale=i}yAxisSync(t,i){this.yAxisOffset=t,this.yAxisScale=i}resize(t,i){if(!t||!i){let e=this.canvas.element.getBoundingClientRect();t=t||e.width,i=i||e.height,t=Math.round(t),i=Math.round(i)}0!==this.canvas.width&&this.panX((t-this.canvas.width)*(this.xAnchor+this._xAnchorOffset)),0!==this.canvas.height&&this.panY((i-this.canvas.height)*(this.yAnchor+this._yAnchorOffset)),this.canvas.width=t,this.canvas.height=i,this.renderer&&this.renderer.resize(this.canvas.width,this.canvas.height)}repaint(){this.renderer&&(this._updateGrids(),this._updateLabel(),this._requestID||(this._requestID=window.requestAnimationFrame(()=>{this._requestID=null,this.renderer.render(this.stage)})))}_updateGrids(){let t,i,e,h;if(this.bgGraphics.clear(),this.bgGraphics.beginFill("#171717"),this.hticks){let h=this.pixelToValueH(0),l=this.pixelToValueH(this.canvas.width);this.hticks.range(h,l,this.canvas.width);for(let h=this.hticks.minTickLevel;h<=this.hticks.maxTickLevel;++h)if((i=this.hticks.tickRatios[h])>0){this.bgGraphics.lineStyle(1,"#171717",.5*i),t=this.hticks.ticksAtLevel(h,!0);for(let i=0;i<t.length;++i)e=this.valueToPixelH(t[i]),this.bgGraphics.moveTo(s(e),-1),this.bgGraphics.lineTo(s(e),this.canvas.height)}}if(this.vticks){let e=this.pixelToValueV(0),l=this.pixelToValueV(this.canvas.height);this.vticks.range(e,l,this.canvas.height);for(let e=this.vticks.minTickLevel;e<=this.vticks.maxTickLevel;++e)if((i=this.vticks.tickRatios[e])>0){this.bgGraphics.lineStyle(1,"#171717",.5*i),t=this.vticks.ticksAtLevel(e,!0);for(let i=0;i<t.length;++i)h=this.valueToPixelV(t[i]),this.bgGraphics.moveTo(0,s(h)),this.bgGraphics.lineTo(this.canvas.width,s(h))}}this.bgGraphics.endFill(),this.showDebugInfo&&(this.set("debugInfo.xAxisScale",this.xAxisScale.toFixed(3)),this.set("debugInfo.xAxisOffset",this.xAxisOffset.toFixed(3)),this.hticks&&(this.set("debugInfo.xMinLevel",this.hticks.minTickLevel),this.set("debugInfo.xMaxLevel",this.hticks.maxTickLevel)),this.set("debugInfo.yAxisScale",this.yAxisScale.toFixed(3)),this.set("debugInfo.yAxisOffset",this.yAxisOffset.toFixed(3)),this.vticks&&(this.set("debugInfo.yMinLevel",this.vticks.minTickLevel),this.set("debugInfo.yMaxLevel",this.vticks.maxTickLevel)))}_updateLabel(){if(null!==this.getAttribute("show-label-h")&&this.hticks){let i=this.hticks.levelForStep(50),e=this.hticks.ticksAtLevel(i,!1),h=this.hticks.ticks[i],l=Math.max(0,-Math.floor(Math.log10(h))),a="0,"+Number(0).toFixed(l);for(e.forEach((i,e)=>{let h=s(this.valueToPixelH(i))+5,l=this.label.hElement.children[e];l||(l=document.createElement("span"),this.label.hElement.appendChild(l)),this.hformat?l.innerText=this.hformat(i):l.innerText=t(i).format(a),l.style.transform=`translateX(${s(h)}px)`});this.label.hElement.children.length>e.length;){let t=this.label.hElement.children.length-1,i=this.label.hElement.children[t];this.label.hElement.removeChild(i)}}else for(;this.label.hElement.children.length>0;){let t=this.label.hElement.children.length-1,i=this.label.hElement.children[t];this.label.hElement.removeChild(i)}if(null!==this.getAttribute("show-label-v")&&this.vticks){let i=this.vticks.levelForStep(50),e=this.vticks.ticksAtLevel(i,!1),h=this.vticks.ticks[i],l=Math.max(0,-Math.floor(Math.log10(h))),a="0,"+Number(0).toFixed(l);for(e.forEach((i,e)=>{let h=s(this.valueToPixelV(i))-15,l=this.label.vElement.children[e];l||(l=document.createElement("span"),this.label.vElement.appendChild(l)),this.vformat?l.innerText=this.vformat(i):l.innerText=t(i).format(a),l.style.transform=`translateY(${s(h)}px)`});this.label.vElement.children.length>e.length;){let t=this.label.vElement.children.length-1,i=this.label.vElement.children[t];this.label.vElement.removeChild(i)}}else for(;this.label.vElement.children.length>0;){let t=this.label.vElement.children.length-1,i=this.label.vElement.children[t];this.label.vElement.removeChild(i)}}};