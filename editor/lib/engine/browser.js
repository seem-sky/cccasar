"use strict";
const {
    ipcMain: i
} = require("electron"), e = require("fire-fs");
module.exports = new class {
    async showBuildingPage(i) {
        i ? (this.buildingWin = new Editor.Window("importing", {
            title: "Building Engine",
            width: 350,
            height: 120,
            alwaysOnTop: !0,
            show: !1,
            resizable: !1,
            save: !1,
            frame: !1
        }), this.buildingWin.load("app://editor/page/building-engine.html"), await new Promise(i => {
            this.buildingWin.nativeWin.once("ready-to-show", () => {
                this.buildingWin && this.buildingWin.show(), i()
            })
        })) : (this.buildingWin && this.buildingWin.close(), this.buildingWin = null)
    }
    async build() {
        let i = Editor.require("app://editor/share/quick-compile/build-engine");
        if (Editor.require("app://editor/share/quick-compile/check-auto-build-engine")()) Editor.log(Editor.T("EDITOR_MAIN.building_engine")), await this.showBuildingPage(!0), this.engineCompiler = await new Promise(e => {
            let t = i({
                enableWatch: Editor.App._profile.data["watch-js-engine"],
                enginePath: Editor.url("unpack://engine")
            }, () => {
                this.showBuildingPage(!1), e(t)
            })
        });
        else {
            let t = Editor.url("unpack://engine-dev");
            e.existsSync(t) || (Editor.warn(`Can not find ${t}, force auto build engine.`), await this.showBuildingPage(!0), await new Promise(e => {
                i({
                    enginePath: Editor.url("unpack://engine")
                }, () => {
                    this.showBuildingPage(!1), e()
                })
            }))
        }
    }
    async init() {
        Editor.log("Initializing Cocos2d");
        let i = Editor.Profile.load("profile://local/settings.json"),
            e = Editor.Profile.load("profile://global/settings.json"),
            t = i.data;
        !1 !== i.data["use-global-engine-setting"] && (t = e.data);
        let n = t["use-default-js-engine"];
        if (!n) try {
            require(Editor.url("unpack://engine-dev"))
        } catch (o) {
            Editor.Dialog.messageBox({
                type: "error",
                buttons: [Editor.T("MESSAGE.ok")],
                message: Editor.T("EDITOR_MAIN.custom_engine_failed"),
                detail: o.stack,
                noLink: !0
            }), n = t["use-default-js-engine"] = !0, i.save(), e.save()
        }
        if (n) try {
            require(Editor.url("unpack://engine-dev"))
        } catch (i) {
            throw Editor.Dialog.messageBox({
                type: "error",
                buttons: [Editor.T("MESSAGE.ok")],
                message: Editor.T("EDITOR_MAIN.builtin_engine_failed"),
                detail: i.stack,
                noLink: !0
            }), new Error(Editor.T("EDITOR_MAIN.builtin_engine_failed"))
        }
    }
    async initExtends() {
        Editor.log("Initializing engine extends");
        try {
            require("../../share/engine-extends/init"), require("../../share/engine-extends/serialize")
        } catch (i) {
            throw Editor.Dialog.messageBox({
                type: "error",
                buttons: ["OK"],
                title: "Initializing engine extends failed",
                message: "Maybe the reason is: You are using custom JS engine and it is out-dated.",
                detail: `Error call stack : ${err.stack}`,
                defaultId: 0,
                cancelId: 0,
                noLink: !0
            }), new Error(Editor.T("Maybe the reason is: You are using custom JS engine and it is out-dated."))
        }
    }
    initSceneList() {
        Editor.assetdb.queryAssets(null, "scene", function (i, e) {
            Editor.sceneList = e.map(i => i.uuid)
        });
        let i = Editor._projectLocalProfile.data["last-edit"];
        Editor.assetdb.existsByUuid(i) || (i = Editor._projectProfile.data["start-scene"], Editor.assetdb.existsByUuid(i) || (i = null), Editor._projectLocalProfile.data["last-edit"] = i, Editor._projectLocalProfile.save()), Editor.currentSceneUuid = i
    }
}, i.on("app:rebuild-editor-engine", i => {
    module.exports.engineCompiler ? module.exports.engineCompiler.rebuild(i.reply) : i.reply()
});