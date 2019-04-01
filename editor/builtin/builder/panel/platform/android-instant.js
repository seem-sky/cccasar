"use strict";const t=require("fs"),e=require("fire-path"),a=require("url"),i=require("electron"),n=require(Editor.url("packages://builder/panel/platform/common"));exports.template=`\n    <ui-prop name="${Editor.T("BUILDER.template")}">\n        <ui-select class="flex-1" v-value="data.template">\n            <option>android-instant</option>\n        </ui-select>\n    </ui-prop>\n    \n    <ui-prop name="${Editor.T("BUILDER.package_name")}">\n        <ui-input class="flex-1" v-value="project.packageName"></ui-input>\n    </ui-prop>\n    \n    <ui-prop name="${Editor.T("BUILDER.remote_server")}">\n        <ui-input class="flex-1" v-value="project['android-instant'].REMOTE_SERVER_ROOT" placeholder="${Editor.T("BUILDER.optional_input_tips")}"></ui-input>\n    </ui-prop>\n    \n    <ui-prop name="${Editor.T("BUILDER.default_url")}">\n        <ui-input class="flex-1" v-value="default_url" placeholder="${Editor.T("BUILDER.optional_input_tips")}"></ui-input>\n        \n    </ui-prop>\n     \n     <ui-prop name="${Editor.T("BUILDER.record_path")}">\n        <ui-input class="flex-1" v-value="project['android-instant'].recordPath"></ui-input>\n        <ui-button class="tiny" v-on:confirm="_onChooseDistPathClick">···</ui-button>\n        <ui-button class="tiny" v-on:confirm="_onRefactorClick">${Editor.T("MESSAGE.refactor.open_refactor")}</ui-button>\n    </ui-prop>\n\n    <ui-prop name="API Level">\n        <ui-select class="flex-1" v-value="data.apiLevel">\n            <template v-for="item in apiLevels">\n                <option v-bind:value="item">{{item}}</option>\n            </template>\n        </ui-select>\n    </ui-prop>\n\n    <ui-prop name="APP ABI" auto-height>\n        <div class="layout vertical">\n            <ui-checkbox class="item" v-value="armeabiV7a">\n                armeabi-v7a\n            </ui-checkbox>\n            <ui-checkbox class="item" v-value="arm64V8a">\n                arm64-v8a\n            </ui-checkbox>\n            <ui-checkbox class="item" v-value="x86">\n                x86\n            </ui-checkbox>\n        </div>\n    </ui-prop>\n\n    <ui-prop name="${Editor.T("KEYSTORE.keystore")}">\n        <ui-checkbox v-value="data.useDebugKeystore">\n            ${Editor.T("KEYSTORE.use_debug_keystore")}\n        </ui-checkbox>\n    </ui-prop>\n\n    \x3c!-- mi --\x3e\n    \n    <ui-prop name="${Editor.T("KEYSTORE.keystore_path")}" v-disabled="data.useDebugKeystore">\n        <div class="layout horizontal center flex-1">\n            <ui-input class="flex-2" v-value="data.keystorePath"></ui-input>\n            <ui-button class="tiny" v-on:confirm="_onChooseKeystoreClick">\n                ···\n            </ui-button>\n            <ui-button class="tiny" v-on:confirm="_onShowKeystoreClick">\n                ${Editor.T("SHARED.open")}\n            </ui-button>\n            <ui-button class="tiny" v-on:confirm="_onNewKeystoreClick">\n                ${Editor.T("SHARED.new")}\n            </ui-button>\n        </div>\n    </ui-prop>\n    \n    <ui-prop name="${Editor.T("KEYSTORE.keystore_password")}" v-disabled="data.useDebugKeystore">\n        <ui-input class="flex-1" password v-value="data.keystorePassword"></ui-input>\n    </ui-prop>\n    \n    <ui-prop name="${Editor.T("KEYSTORE.keystore_alias")}" v-disabled="data.useDebugKeystore">\n        <ui-input class="flex-1" v-value="data.keystoreAlias"></ui-input>\n    </ui-prop>\n    \n    <ui-prop name="${Editor.T("KEYSTORE.keystore_alias_password")}" v-disabled="data.useDebugKeystore">\n        <ui-input class="flex-1" password v-value="data.keystoreAliasPassword"></ui-input>\n    </ui-prop>\n\n    \x3c!-- mi --\x3e\n\n    <ui-prop name="${Editor.T("BUILDER.orientation")}" auto-height>\n        <div class="layout vertical">\n            <ui-checkbox class="item" v-value="portrait">\n                Portrait\n            </ui-checkbox>\n            <ui-checkbox class="item" v-value="upsideDown">\n                Upside Down\n            </ui-checkbox>\n            <ui-checkbox class="item" v-value="landscapeLeft">\n                Landscape Left\n            </ui-checkbox>\n            <ui-checkbox class="item" v-value="landscapeRight">\n                Landscape Right\n            </ui-checkbox>\n        </div>\n    </ui-prop>\n\n\x3c!-- todo: 在完成支持以前，暂时删除anysdk的支持>\n    ${n.native.anysdk}\n<--\x3e\n    ${n.native.sdkbox}\n    ${n.native.xxtea}\n`,exports.name="android-instant",exports.props={data:null,project:null,anysdk:null},exports.data=function(){var t=this.project.orientation;return{portrait:t.portrait,upsideDown:t.upsideDown,landscapeLeft:t.landscapeLeft,landscapeRight:t.landscapeRight,templates:[],apiLevels:[],armeabiV7a:this.data.appABIs.indexOf("armeabi-v7a")>=0,arm64V8a:this.data.appABIs.indexOf("arm64-v8a")>=0,x86:this.data.appABIs.indexOf("x86")>=0,default_url:""}},exports.watch={portrait:{handler(t){this.project&&(this.project.orientation.portrait=t)}},upsideDown:{handler(t){this.project&&(this.project.orientation.upsideDown=t)}},landscapeLeft:{handler(t){this.project&&(this.project.orientation.landscapeLeft=t)}},landscapeRight:{handler(t){this.project&&(this.project.orientation.landscapeRight=t)}},armeabiV7a:{handler(t){this._abiValueChanged("armeabi-v7a",t)}},arm64V8a:{handler(t){this._abiValueChanged("arm64-v8a",t)}},x86:{handler(t){this._abiValueChanged("x86",t)}},default_url:{handler(t){let e=this.project["android-instant"],i=a.parse(t),n=i.protocol;e.scheme=n?n.substr(0,n.length-1):"",e.host=i.host||"",e.pathPattern=i.pathname||""}}},exports.created=function(){this._load_default(),this.lastTemplate=this.data.template,Editor.Ipc.sendToMain("app:query-cocos-templates",(t,e)=>{if(t)return Editor.warn(t);if(e.forEach(t=>{this.templates.push(t)}),this.data){this.data.template;if(e.length<=0)return this.data.template="";this.data.template="android-instant"}}),Editor.Ipc.sendToMain("app:query-android-instant-apilevels",(t,e)=>{if(t)return Editor.warn(t);if(e.forEach(t=>{this.apiLevels.push(t)}),this.data){var a=this.data.apiLevel;if(e.length<=0)return this.data.apiLevel="";-1===e.indexOf(a)&&(this.data.apiLevel=e[0])}})},exports.directives={},exports.destroyed=function(){this.data.template=this.lastTemplate},exports.methods={_load_default(){process.nextTick(()=>{let t=this.project["android-instant"];t.recordPath||(t.recordPath=""),t.REMOTE_SERVER_ROOT||(t.REMOTE_SERVER_ROOT=`http://${Editor.remote.Network.ip}:${Editor.remote.PreviewServer.previewPort}/preview-android-instant/`),t.hasOwnProperty("host")||(t.host=`org.cocos2d.${this.project.title}`),t.hasOwnProperty("pathPattern")||(t.pathPattern="/game"),t.hasOwnProperty("scheme")||(t.scheme="https"),t.host&&t.scheme&&t.pathPattern&&(this.default_url=`${t.scheme}://${t.host}${t.pathPattern}`)})},_onChooseKeystoreClick(t){t.stopPropagation();let e=Editor.Dialog.openFile({defaultPath:this.data.keystorePath||this.data.buildPath,properties:["openFile"],filters:[{name:"Keystore",extensions:["keystore"]}],title:"Open Keystore"});e&&e[0]&&(this.data.keystorePath=e[0])},_onShowKeystoreClick(e){if(e.stopPropagation(),!t.existsSync(this.data.keystorePath))return Editor.warn("%s not exists!",this.data.keystorePath),void 0;i.shell.showItemInFolder(this.data.keystorePath),i.shell.beep()},_onNewKeystoreClick:function(t){t.stopPropagation(),Editor.Ipc.sendToMain("keystore:open")},_abiValueChanged:function(t,e){if(this.data.appABIs){var a=this.data.appABIs.indexOf(t);e?a<0&&this.data.appABIs.push(t):a>=0&&this.data.appABIs.splice(a,1)}},_onRefactorClick(t){Editor.Panel.open("google-instant-games",{recordPath:this.project["android-instant"].recordPath})},_onChooseDistPathClick(t){t.stopPropagation();let a=Editor.Dialog.openFile({defaultPath:e.join(Editor.Project.path,"/temp/android-instant-games/profiles"),properties:["openDirectory"]});if(a&&a[0]){this.project["android-instant"].recordPath=a[0]}}};