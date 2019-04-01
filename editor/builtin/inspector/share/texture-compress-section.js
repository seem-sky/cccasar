"use strict";Vue.component("texture-format",{template:'\n    <style>\n        .wrapper {\n            display: flex;\n            flex-direction: column;\n            padding: 5px 15px;\n            border-top: rgba(0, 0, 0, 0.58) dashed 1px;\n        }\n    </style>\n    <div style="min-height: 40px;">\n        <div \n            style="margin-top: 10px; margin-bottom: 10px"\n            class="layout horizontal center-center"\n        >\n            <ui-select\n                style="width: 240px;"\n                @confirm="onSelectFormat"\n                v-value="selectValue"\n            >\n                <option value="none">Select A Format To Add</option>\n                <option value="png">PNG</option>\n                <option value="jpg">JPG</option>\n                <option value="webp">Webp</option>\n                <option v-if="supportFormat(\'pvr\')" value="pvrtc_4bits">PVRTC 4bits RGBA</option>\n                <option v-if="supportFormat(\'pvr\')" value="pvrtc_4bits_rgb">PVRTC 4bits RGB</option>\n                <option v-if="supportFormat(\'pvr\')" value="pvrtc_2bits">PVRTC 2bits RGBA</option>\n                <option v-if="supportFormat(\'pvr\')" value="pvrtc_2bits_rgb">PVRTC 2bits RGB</option>\n            </ui-select>\n        </div>\n        <div>\n            <div \n                v-for="format in formats"\n                class="wrapper"\n            >\n                <div style="display:flex;">\n                    <span style="flex:1;">{{format.name}}</span>\n                    <ui-button class="mini" @confirm="deleteFormat(format)">\n                        x\n                    </ui-button>\n                </div>\n                <ui-prop \n                    type="enum"\n                    name="Quality"\n                    v-value="format.quality"\n                    v-if="isTCFormat(format.name)"\n                >\n                    <option value="fastest">Fastest</option>\n                    <option value="fast">Fast</option>\n                    <option value="normal">Normal</option>\n                    <option value="high">High</option>\n                    <option value="best">Best</option>\n                </ui-prop>\n                <ui-prop \n                    type="number"\n                    name="Quality"\n                    v-value="format.quality"\n                    v-if="!isTCFormat(format.name)"\n                >\n                </ui-prop>\n            </div>\n        </div>\n    </div>\n    ',props:{settings:{twoWay:!0,type:Object},platform:{type:String}},data:function(){return{selectValue:"none",formats:[]}},watch:{settings(){this.formats=this.settings[this.platform]?this.settings[this.platform].formats:[]}},compiled(){this.formats=this.settings[this.platform]?this.settings[this.platform].formats:[]},methods:{onSelectFormat(t){if("none"===this.selectValue)return;let n=this.settings[this.platform];n||(n=this.settings[this.platform]={formats:[]},this.formats=n.formats);let a=n.formats.find(t=>t.name===this.selectValue);a||(a={name:this.selectValue,quality:this.defaultQuality(this.selectValue)},this.formats.push(a)),setTimeout(()=>{this.selectValue="none"},0)},isTCFormat:t=>-1!==t.indexOf("pvrtc_")||-1!==t.indexOf("etc2"),defaultQuality(t){return this.isTCFormat(t)?"normal":80},deleteFormat(t){let n=this.settings[this.platform].formats.findIndex(n=>n.name===t.name);-1!==n&&this.formats.splice(n,1)},supportFormat(t){return"pvr"!==t||"android"!==this.platform&&"default"!==this.platform}}}),Vue.component("texture-compress",{template:'\n    <style>\n        .compress-option {\n            margin-top: 15px;\n            margin-bottom: 10px;\n            margin-left: 10px;\n            background-color: rgba(105, 105, 105, 0.45);\n        }\n\n        .compress-option ui-prop {\n            margin-right: 10px;\n        }\n\n        .compress-tab {\n            display: flex;\n            flex: 1;\n            flex-direction: row;\n            border-bottom: rgba(43, 40, 40, 0.52) solid 2px;\n        }\n\n        .compress-tab span {\n            flex: 1;\n            text-align: center;\n            padding: 10px 0px;\n        }\n\n        .compress-tab span.icon {\n            font-size: 15px;\n        }\n\n        .compress-tab span.active {\n            background-color: black;\n        }\n    </style>\n\n    <div class="compress-option">\n        <div class="compress-tab flex layout row flex-1">\n            <span \n                @click="changePlatform(\'default\')"    \n                :class="activeClass(\'default\')"                         \n            >\n                Default\n            </span>\n            <span \n                @click="changePlatform(\'android\')"    \n                :class="activeClass(\'android\') + \' icon fa fa-android\'"\n                tooltip="Android"\n            ></span>\n            <span \n                @click="changePlatform(\'ios\')"        \n                :class="activeClass(\'ios\') + \' icon fa fa-mobile\'"     \n                tooltip="Ios"\n            ></span>\n            <span \n                @click="changePlatform(\'wechatgame\')"\n                :class="activeClass(\'wechatgame\') + \' icon fa fa-comments\'"\n                tooltip="Wechat Game"\n            ></span>\n            <span \n                @click="changePlatform(\'web\')"        \n                :class="activeClass(\'web\') + \' icon fa fa-html5\'"\n                tooltip="Web Html5"\n            ></span>\n        </div>\n        <div v-for="platform in platforms" :class="\'compress-\' + platform">\n            <texture-format :platform="platform" :settings.sync="target.platformSettings" v-if="currentPlatfrom === platform"/>\n        </div>\n    </div>\n    ',props:{target:{twoWay:!0,type:Object}},data:function(){return{currentPlatfrom:"default",platforms:["default","android","ios","wechatgame","web"]}},methods:{changePlatform(t){this.currentPlatfrom=t},activeClass(t){return this.currentPlatfrom===t?"active":""},isPVRTC:t=>-1!==t.indexOf("pvrtc_")}});