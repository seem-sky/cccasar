"use strict";
const e = require("./scene-undo"),
    r = require("./scene-query"),
    t = require("./scene-operation"),
    i = require("./scene-animation"),
    o = require("./scene-layout"),
    a = Editor.require("scene://edit-mode"),
    n = Editor.require("scene://utils/particle");
let s = {
    "is-ready"(e) {
        e.reply(null, this._viewReady)
    },
    "new-scene"() {
        this.confirmCloseScene(() => {
            this._newScene()
        })
    },
    saved() {
        _Scene.Undo.save()
    },
    "play-on-device"() {
        _Scene.stashScene(() => {
            Editor.Ipc.sendToMain("app:play-on-device")
        })
    },
    "reload-on-device"() {
        _Scene.stashScene(() => {
            Editor.Ipc.sendToMain("app:reload-on-device")
        })
    },
    "preview-server-scene-stashed"() {
        _Scene.stashScene(() => {
            Editor.Ipc.sendToMain("app:preview-server-scene-stashed")
        })
    },
    "load-package-scene-script"(e, r, t) {
        this._loadSceneScript(r, t)
    },
    "unload-package-scene-script"(e, r) {
        this._unloadSceneScript(r)
    },
    "stash-and-reload"() {
        _Scene.stashScene(() => {
            this.reload()
        })
    },
    "soft-reload"(e, r) {
        a.softReload(r)
    },
    "enter-prefab-edit-mode"(e, r) {
        cc.AssetLibrary.loadAsset(r, (e, t) => e ? (Editor.error(e), void 0) : t.readonly ? (Editor.warn("The prefab is readonly, can not be modified."), void 0) : (a.push("prefab", r), void 0))
    },
    "stash-and-save"() {
        a.save()
    },
    "print-simulator-log"(e, r, t) {
        let i = "Simulator: ";
        if (-1 !== r.indexOf("project.dev.js:")) {
            let e = r.split(":"),
                t = Path.join(Editor.remote.Project.path, "library/bundle.project.js"),
                a = Number.parseInt(e[1]),
                n = r.substring(r.indexOf(":" + e[2]) + 1, r.length);
            var o = new Error(n);
            return o.stack = `${i}${n}\n    at a (${t}?009:${a}:0)`, Editor.error(o), void 0
        }
        "error" === t ? Editor.error(i + r) : "warn" === t ? Editor.warn(i + r) : Editor.log(i + r)
    },
    "generate-texture-packer-preview-files": async function (e, r) {
        const t = Editor.require("app://editor/page/build/texture-packer");
        try {
            await t.generatePreviewFiles(r)
        } catch (r) {
            return Editor.error(r), e.reply && e.reply(r), void 0
        }
        e.reply && e.reply()
    },
    "query-texture-packer-preview-files": function (e, r) {
        Editor.require("app://editor/page/build/texture-packer").queryPreviewInfo(r, (r, t) => {
            e.reply ? e.reply(r, t) : r && Editor.error(r)
        })
    },
    "export-particle-plist": function (e, r) {
        n.exportParticlePlist(r)
    }
};
Object.keys(e).forEach(r => {
    s[r] = e[r]
}), Object.keys(r).forEach(e => {
    s[e] = r[e]
}), Object.keys(t).forEach(e => {
    s[e] = t[e]
}), Object.keys(i).forEach(e => {
    s[e] = i[e]
}), Object.keys(o).forEach(e => {
    s[e] = o[e]
}), module.exports = s;