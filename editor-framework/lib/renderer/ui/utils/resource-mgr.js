"use strict";let e={};module.exports=e;const t=require("../../console");let r={};function i(e){return new Promise(function(t,r){let i=new window.XMLHttpRequest;i.open("GET",e,!0),i.onreadystatechange=function(n){if(4!==i.readyState)return;-1===[0,200,304].indexOf(i.status)?r(new Error(`While loading from url ${e} server responded with a status of ${i.status}`)):t(n.target.response)},i.send(null)})}function n(e,i){return void 0===i?(t.error(`Failed to load resource: ${e}`),r[e]=void 0,void 0):(r[e]=i,i)}function o(e,i){return void 0===i?(t.error(`Failed to load stylesheet: ${e}`),r[e]=void 0,void 0):(i+=`\n//# sourceURL=${e}`,r[e]=i,i)}function s(e,i){if(void 0===i)return t.error(`Failed to load script: ${e}`),r[e]=void 0,void 0;i+=`\n//# sourceURL=${e}`;let n=window.eval(i);return r[e]=n,n}e.getResource=function(e){return r[e]},e.importStylesheet=function(e){let t=r[e];return void 0!==t?new Promise(function(e){e(t)}):i(e).then(o.bind(this,e),o.bind(this,e,void 0))},e.importStylesheets=function(r){if(!Array.isArray(r))return t.error("Call to `importStylesheets` failed. The`urls` parameter must be an array"),void 0;let i=[];for(let t=0;t<r.length;++t){let n=r[t];i.push(e.importStylesheet(n))}return Promise.all(i)},e.loadGlobalScript=function(e,t){let r=document.createElement("script");r.type="text/javascript",r.onload=function(){t&&t()},r.src=e,document.head.appendChild(r)},e.importScript=function(e){let t=r[e];return void 0!==t?new Promise(function(e){e(t)}):i(e).then(s.bind(this,e),s.bind(this,e,void 0))},e.importScripts=function(r){if(!Array.isArray(r))return t.error("Call to `importScripts` failed. The`urls` parameter must be an array"),void 0;let i=[];for(let t=0;t<r.length;++t){let n=r[t];i.push(e.importScript(n))}return Promise.all(i)},e.importTemplate=function(e){let t=r[e];return void 0!==t?new Promise(function(e){e(t)}):i(e).then(n.bind(this,e),n.bind(this,e,void 0))},e.importResource=function(e){let t=r[e];return void 0!==t?new Promise(function(e){e(t)}):i(e).then(n.bind(this,e),n.bind(this,e,void 0))};