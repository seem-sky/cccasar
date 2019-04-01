"use strict";let t=require("./collider-gizmo"),e=require("../tools"),o={None:0,Point:1,Line:2,Center:3},r=cc.vmath.mat4.create();module.exports=class extends t{onCreateMoveCallbacks(){let t,e,i;return{start:(r,l,s,n)=>{if(n===o.Point){let e=s.currentTarget.instance;if(i=e.point.origin,t=i.clone(),s.ctrlKey||s.metaKey){this.recordChanges();let t=this.target.points;t.splice(t.indexOf(i),1),this.commitChanges()}}else if(n===o.Center)e=this.target.offset;else if(n===o.Line){this.recordChanges();let t=this.node.convertToNodeSpace(cc.v2(r,l)).sub(this.target.offset),e=s.currentTarget.instance,o=e.startSvgPoint.point.origin,i=e.endSvgPoint.point.origin,n=this.target.points.indexOf(o)+1,a=o.x-i.x,c=o.y-i.y,h=(t.x-o.x)*(o.x-i.x)+(t.y-o.y)*(o.y-i.y);h/=a*a+c*c,t.x=o.x+h*a,t.y=o.y+h*c,this.adjustValue(t),this.target.points.splice(n,0,t),this.commitChanges()}},update:(l,s,n,a)=>{this.node.getWorldMatrix(r),cc.vmath.mat4.invert(r,r),r.m12=r.m13=0;let c=cc.v2(l,s);if(a===o.Point){if(n.ctrlKey||n.metaKey)return;cc.vmath.vec2.transformMat4(c,c,r),c=c.addSelf(t),this.adjustValue(c),i.x=c.x,i.y=c.y}else a===o.Center&&(cc.vmath.vec2.transformMat4(c,c,r),c=c.addSelf(e),this.adjustValue(c),this.target.offset=c);this._view.repaintHost()}}}onCreateRoot(){let t=this._root,r=t.dragArea=t.polygon().fill({color:"rgba(0,128,255,0.2)"}).stroke("none").style("pointer-events","fill");this.registerMoveSvg(r,o.Center);let i=t.linesGroup=t.group(),l=[];i.style("pointer-events","stroke").style("cursor","copy").hide();let s=()=>e.lineTool(i,cc.v2(0,0),cc.v2(0,0),"#7fc97a",null,this.createMoveCallbacks(o.Line)),n=t.pointsGroup=t.group(),a=[];n.hide();let c=()=>{let t=e.circleTool(n,5,{color:"#7fc97a"},null,"pointer",this.createMoveCallbacks(o.Point));return t.on("mouseover",function(e){(e.ctrlKey||e.metaKey)&&(t.fill({color:"#f00"}),t.l1.stroke({color:"#f00"}),t.l2.stroke({color:"#f00"}))}),t.on("mouseout",function(e){t.fill({color:"#7fc97a"}),t.l1.stroke({color:"#7fc97a"}),t.l2.stroke({color:"#7fc97a"})}),t};t.plot=(t=>{let e=[];for(let o=0,r=t.length;o<r;o++){let i=o===r-1?0:o+1,n=t[o];if(e.push([n.x,n.y]),!this.target.editing)continue;let h=a[o];h||(h=a[o]=c()),h.point=n,h.show(),h.center(n.x,n.y);let g=a[i];g||(g=a[i]=c());let d=l[o];d||(d=l[o]=s());let f=n,u=t[i];d.show(),d.plot(f.x,f.y,u.x,u.y),d.startSvgPoint=h,d.endSvgPoint=g,h.l1=d,g.l2=d}r.plot(e);for(let e=t.length,o=a.length;e<o;e++)a[e].hide(),l[e].hide()})}onUpdate(){let t=this.target.points,e=this.target.offset;this.node.getWorldMatrix(r);let o=[];for(let i=0,l=t.length;i<l;i++){let l=t[i].add(e);cc.vmath.vec2.transformMat4(l,l,r),(l=this.worldToPixel(l)).origin=t[i],o.push(l)}this._root.plot(o)}enterEditing(){let t=this._root;t.pointsGroup.show(),t.dragArea.style("cursor","move"),t.linesGroup.show()}leaveEditing(){let t=this._root;t.pointsGroup.hide(),t.linesGroup.hide(),t.dragArea.style("cursor",null)}};