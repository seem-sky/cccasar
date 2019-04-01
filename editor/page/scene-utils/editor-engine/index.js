"use strict";const t=require("../utils/node"),e=require("../utils/animation"),i=require("./lib/ticker"),n=require("./lib/time"),c=require("./lib/playable"),r=cc.Class({name:"EditorEngine",extends:c,ctor:function(){var t=arguments[0];this._requestId=-1,this._useDefaultMainLoop=t,this._isInitializing=!1,this._isInitialized=!1,this._loadingScene="",this._bindedTick=(CC_EDITOR||t)&&this._tick.bind(this),this.maxDeltaTimeInEM=.2,this.animatingInEditMode=!1,this._shouldRepaintInEM=!1,this._forceRepaintId=-1,this.attachedObjsForEditor={},this._designWidth=0,this._designHeight=0},properties:{isInitialized:{get:function(){return this._isInitialized}},loadingScene:{get:function(){return this._loadingScene}},forceRepaintIntervalInEM:{default:500,notify:CC_EDITOR&&function(){if(-1!==this._forceRepaintId&&clearInterval(this._forceRepaintId),this.forceRepaintIntervalInEM>0){var t=this;this._forceRepaintId=setInterval(function(){t.repaintInEditMode()},this.forceRepaintIntervalInEM)}}},editingRootNode:null},init:function(t,e){if(this._isInitializing)return cc.error("Editor Engine already initialized"),void 0;this._isInitializing=!0;var i=this;this.createGame(t,function(n){i._isInitialized=!0,i._isInitializing=!1,e(n),CC_EDITOR&&!t.dontTick&&i.startTick()})},createGame:function(t,e){cc.macro.ENABLE_TRANSPARENT_CANVAS=!0;var i={width:t.width,height:t.height,showFPS:!1,debugMode:cc.debug.DebugMode.INFO,frameRate:60,id:t.id,renderMode:CC_EDITOR?2:t.renderMode,registerSystemEvent:!CC_EDITOR,jsList:[],noCache:!0,groupList:t.groupList,collisionMatrix:t.collisionMatrix};cc.game.run(i,function(){CC_EDITOR&&(cc.view.enableRetina(!1),cc.game.canvas.style.imageRendering="pixelated"),cc.view.setDesignResolutionSize(t.designWidth,t.designHeight,cc.ResolutionPolicy.SHOW_ALL),cc.view.setCanvasSize(i.width,i.height);var n=new cc.Scene;cc.director.runSceneImmediate(n),cc.game.pause(),CC_EDITOR&&(cc.game.canvas.setAttribute("tabindex",-1),cc.game.canvas.style.backgroundColor=""),e&&e()})},playInEditor:function(){CC_EDITOR&&(Editor.require("unpack://engine-dev/cocos2d/core/platform/CCInputManager").registerSystemEvent(cc.game.canvas),cc.game.canvas.setAttribute("tabindex",99),cc.game.canvas.style.backgroundColor="black",cc.imeDispatcher._domInputControl&&cc.imeDispatcher._domInputControl.setAttribute("tabindex",2));cc.director.resume()},tick:function(t,e){cc.director.mainLoop(t,e)},tickInEditMode:function(t,e){CC_EDITOR&&cc.director.mainLoop(t,e)},repaintInEditMode:function(){CC_EDITOR&&!this._isUpdating&&(this._shouldRepaintInEM=!0)},getInstanceById:function(t){return this.attachedObjsForEditor[t]||null},getIntersectionList:function(e,i){var n=this.getInstanceById(this.editingRootNode),c=!0;n||(c=!1,n=cc.director.getScene());var r=[],a=new cc.Vec2,o=new cc.Vec2,s=new cc.Vec2,d=new cc.Vec2,l=new Editor.Utils.Polygon([a,o,s,d]),u=new cc.Rect,h=new cc.Rect,g=cc.vmath.mat4.create();function _(t,n){if(n._getLocalBounds){var c=u;if(n._getLocalBounds(c),c.width<=0||c.height<=0)return null;t.getWorldMatrix(g),cc.engine.obbApplyMatrix(c,g,a,o,s,d);var r=h;if(Editor.Math.calculateMaxRect(r,a,o,s,d),i)return e.containsRect(r)?{aabb:r}:null;if(e.intersects(r)&&Editor.Utils.Intersection.rectPolygon(e,l))return{aabb:r,obb:l}}return n.gizmo&&n.gizmo.rectHitTest(e,i)?{}:null}return function(t,e,i){i&&function t(e,i){for(var n=e.children,c=n.length-1;c>=0;c--){var r=n[c];t(r,i),i(r)}}(t,i),e&&i&&i(t)}(n,c,function(n){if(n.activeInHierarchy&&!n.getComponent(cc.Canvas)){var c=function(n,c){if(0===c.width||0===c.height)return null;var r=t.getWorldBounds(n,c);if(i)return e.containsRect(r)?{aabb:r}:null;if(e.intersects(r)){var a=t.getWorldOrientedBounds(n,c),o=new Editor.Utils.Polygon(a);if(Editor.Utils.Intersection.rectPolygon(e,o))return{aabb:r,obb:o}}return null}(n,n.getContentSize());if(c)return c.node=n,r.push(c),void 0;for(var a=n._components,o=0,s=a.length;o<s;o++){var d=a[o];if(d.enabled&&(c=_(n,d))){c.node=n,r.push(c);break}}}}),r},setDesignResolutionSize:function(t,e,i){this._designWidth=t,this._designHeight=e,this.emit("design-resolution-changed")},getDesignResolutionSize:function(){return cc.size(this._designWidth,this._designHeight)},obbApplyMatrix(t,e,i,n,c,r){var a=t.x,o=t.y,s=t.width,d=t.height,l=e.m00,u=e.m01,h=e.m04,g=e.m05,_=l*a+h*o+e.m12,I=u*a+g*o+e.m13,f=l*s,m=u*s,p=h*d,E=g*d;n.x=_,n.y=I,c.x=f+_,c.y=m+I,i.x=p+_,i.y=E+I,r.x=f+p+_,r.y=m+E+I},onError:function(t){if(CC_EDITOR)switch(t){case"already-playing":cc.warn("Fireball is already playing")}},onResume:function(){CC_EDITOR&&cc.Object._clearDeferredDestroyTimer(),cc.game.resume(),CC_DEV&&!this._useDefaultMainLoop&&this._tickStop()},onPause:function(){cc.game.pause(),CC_EDITOR&&this._tickStart()},onPlay:function(){if(CC_EDITOR&&!this._isPaused&&cc.Object._clearDeferredDestroyTimer(),this.playInEditor(),this._shouldRepaintInEM=!1,this._useDefaultMainLoop){var t=i.now();n._restart(t),this._tickStart()}else CC_EDITOR&&this._tickStop()},onStop:function(){cc.game.pause(),this._loadingScene="",CC_EDITOR&&(this.repaintInEditMode(),this._tickStart())},startTick:function(){this._tickStart(),this.forceRepaintIntervalInEM=this.forceRepaintIntervalInEM},_tick:function(){this._requestId=i.requestAnimationFrame(this._bindedTick);var t=i.now();this._isUpdating||this._stepOnce?(n._update(t,!1,this._stepOnce?1/60:0),this._stepOnce=!1,this.tick(n.deltaTime,!0)):CC_EDITOR&&(n._update(t,!1,this.maxDeltaTimeInEM),(this._shouldRepaintInEM||this.animatingInEditMode)&&(this.tickInEditMode(n.deltaTime,this.animatingInEditMode),this._shouldRepaintInEM=!1))},_tickStart:function(){-1===this._requestId&&this._tick()},_tickStop:function(){-1!==this._requestId&&(i.cancelAnimationFrame(this._requestId),this._requestId=-1)},reset:function(){cc.game._prepared=!1,cc.game._prepareCalled=!1,cc.game._rendererInitialized=!1,cc.loader.releaseAll()},updateAnimatingInEditMode:function(){if(e.isPlaying())return;let t=Editor.Selection.curSelection("node").map(t=>this.getInstanceById(t));for(let e=0;e<t.length;e++){let i=t[e];if(!i)continue;let n=i._components;for(let t=0;t<n.length;t++){let e=n[t];if(e&&e.constructor._executeInEditMode&&e.isValid&&e.enabledInHierarchy&&e.constructor._playOnFocus)return this.animatingInEditMode=!0,void 0}}this.animatingInEditMode=!1}});module.exports=r;