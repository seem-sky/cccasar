"use strict";var t=require("async"),i=require("fire-path"),r=function(t,i,r,e){var h=4*i+r*e*4;return{r:t[h],g:t[h+1],b:t[h+2],a:t[h+3]}},e=function(t,i,e,h){var s,o,a=h,d=i,f=e,m=0,u=0;for(o=0;o<e;o++)for(s=0;s<i;s++)if(r(t,s,o,i).a>=a){f=o,o=e;break}for(o=e-1;o>=f;o--)for(s=0;s<i;s++)if(r(t,s,o,i).a>=a){u=o-f+1,o=0;break}for(s=0;s<i;s++)for(o=f;o<f+u;o++)if(r(t,s,o,i).a>=a){d=s,s=i;break}for(s=i-1;s>=d;s--)for(o=f;o<f+u;o++)if(r(t,s,o,i).a>=a){m=s-d+1,s=0;break}return[d,f,m,u]};module.exports=class extends Editor.metas.asset{constructor(t){super(t),this.rawTextureUuid="",this.trimType=Editor.App._profile.data["trim-imported-image"]?"auto":"custom",this.trimThreshold=1,this.rotated=!1,this.offsetX=0,this.offsetY=0,this.trimX=0,this.trimY=0,this.width=-1,this.height=-1,this.rawWidth=0,this.rawHeight=0,this.borderTop=0,this.borderBottom=0,this.borderLeft=0,this.borderRight=0,this.vertices=void 0}dests(){return[this._assetdb._uuidToImportPathNoExt(this.uuid)+".json"]}createSpriteFrame(t,r,e){var h=new cc.SpriteFrame,s=this.rawTextureUuid;h.name=i.basenameNoExt(t),h.setOriginalSize(cc.size(r,e)),h.setRect(cc.rect(0,0,this.width,this.height)),h._textureFilename=this._assetdb.uuidToUrl(s),h.setRect(cc.rect(this.trimX,this.trimY,this.width,this.height)),h.setRotated(this.rotated),h.insetTop=this.borderTop,h.insetBottom=this.borderBottom,h.insetLeft=this.borderLeft,h.insetRight=this.borderRight,h.vertices=this.vertices;var o=cc.v2(this.offsetX,this.offsetY);return h.setOffset(o),h}import(i,r){const h=require(Editor.url("app://editor/share/sharp"));var s=this.rawTextureUuid,o=this._assetdb.uuidToFspath(s);if(!o)return r(new Error(`Can not find raw texture for ${i}, uuid not found: ${s}`)),void 0;h.cache(!1),t.waterfall([t=>{h(o).raw().toBuffer(t)},(t,r,h)=>{if(!t||!r)return h(new Error("Can not load image for "+o)),void 0;let s=r.width,a=r.height;if(this.rawWidth=s,this.rawHeight=a,"auto"===this.trimType)if(4!==r.channels)this.trimX=0,this.trimY=0,this.width=s,this.height=a;else{let i=e(t,s,a,this.trimThreshold);this.trimX=i[0],this.trimY=i[1],this.width=i[2],this.height=i[3]}else this.trimX=Editor.Math.clamp(this.trimX,0,s),this.trimY=Editor.Math.clamp(this.trimY,0,a),this.width=Editor.Math.clamp(-1===this.width?s:this.width,0,s-this.trimX),this.height=Editor.Math.clamp(-1===this.height?a:this.height,0,a-this.trimY);this.offsetX=this.trimX+this.width/2-s/2,this.offsetY=-(this.trimY+this.height/2-a/2),this.borderLeft=Editor.Math.clamp(this.borderLeft,0,this.width),this.borderRight=Editor.Math.clamp(this.borderRight,0,this.width-this.borderLeft),this.borderTop=Editor.Math.clamp(this.borderTop,0,this.height),this.borderBottom=Editor.Math.clamp(this.borderBottom,0,this.height-this.borderTop);let d=this.createSpriteFrame(i,s,a);this._assetdb.saveAssetToLibrary(this.uuid,d),h(null,d)}],t=>{h.cache(!0),r&&r(t)})}static defaultType(){return"sprite-frame"}static version(){return"1.0.3"}};