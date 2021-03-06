"use strict";
const e = require("electron").ipcMain,
    t = require("fire-fs"),
    i = (require("fire-path"), require("async")),
    r = require("../editor-framework/lib/share/ipc-listener");
let o = e => {
    process.send && process.send({
        channel: "editor-error",
        message: e.message,
        stack: e.stack
    })
};
process.on("uncaughtException", o), Editor.App.extend({
    runDashboard() {
        Editor.Window.main.close()
    },
    run() {
        if ("string" != typeof Editor._buildCommand && "string" != typeof Editor._compileCommand) {
            Editor.run("app://editor/index.html", {
                title: "Cocos Creator",
                width: 1280,
                height: 720,
                minWidth: 100,
                minHeight: 100,
                show: !1,
                resizable: !0
            });
            var t = Editor.Window.main;
            t.nativeWin.on("close", function () {
                t.closing = !0
            }), e.on("app:is-main-window-attemp-to-close", e => {
                e.returnValue = !!t.closing, t.closing = !1
            }), Editor.Metrics.setClientId(function () {
                Editor.Metrics.prepareUserIdentity(), Editor.Metrics.sendAppInfo(), Editor.Metrics.trackEvent({
                    category: "Editor",
                    action: "Editor Open",
                    label: "new metrics"
                })
            }), process.removeListener("uncaughtException", o)
        }
    },
    quit(e) {
        Editor.Metrics.trackEvent({
            category: "Editor",
            action: "Editor Close",
            label: "new metrics"
        }, e), setTimeout(function () {
            console.log("quit due to request timeout"), e()
        }, 2e3)
    },
    spawnWorker(e, t, i, r, o) {
        const n = "unpack://static/general-worker.html";
        let s, a = !1;
        "function" == typeof t && (o = r, r = i, i = t, t = {}), t.scriptUrl = e,
            function e() {
                s && (clearTimeout(s), s = null);
                const d = new Editor.Window("worker", {
                    show: !!r,
                    save: !1
                });
                s = setTimeout(() => {
                    s = null, a || (Editor.log("Load worker timeout, reload worker."), d.close(), e())
                }, 1e4), a = !1, o && d.nativeWin.webContents.on("crashed", e => {
                    Editor.log("Worker window crashed, reload to restart worker"), d.load(n, t)
                }), r && d.openDevTools(), i && d.nativeWin.webContents.on("did-finish-load", function () {
                    a = !0, i(d, d.nativeWin)
                }), d.load(n, t)
            }()
    },
    loadPackage(e, o) {
        if (e.gizmos)
            for (let t in e.gizmos) {
                Editor.gizmos[t] && Editor.warn(`Override gizmos [${t}] from [${Editor.gizmos[t]}] to [${e.gizmos[t]}]`);
                let i = e.gizmos[t];
                i.startsWith("packages://") ? Editor.gizmos[t] = i : Editor.gizmos[t] = `packages://${e.name}/${i}`
            }
        e["scene-script"] && (Editor.sceneScripts[e.name] = `packages://${e.name}/${e["scene-script"]}`, Editor.Ipc.sendToPanel("scene", "scene:load-package-scene-script", e.name, Editor.sceneScripts[e.name])), e["build-template"] && (Editor.Builder.buildTemplates[e.name] = `packages://${e.name}/${e["build-template"]}`);
        let n = e["simple-build-target"];
        if (n) {
            let t = Editor.require(`packages://${e.name}/${n}`);
            if (t.package = e.name, Editor.Builder.simpleBuildTargets[t.platform] = t, t.messages) {
                let e = function (e, t) {
                        return -1 === t.indexOf(":") ? `${e}:${t}` : t
                    },
                    i = new r;
                for (let r in t.messages) {
                    let o = t.messages[r];
                    "function" == typeof o && i.on(e(t.package, r), o.bind(t))
                }
                t._ipc = i
            }
        }
        if (e.inspector)
            for (let t in e.inspector) Editor.inspectors[t] = `packages://${e.name}/${e.inspector[t]}`;
        var s = e["runtime-resource"],
            a = "",
            d = !1,
            c = "";
        i.waterfall([i => {
            if (!s) return i(), void 0;
            a = Editor.url(`packages://${e.name}/${s.path}`), t.existsSync(a) && t.isDirSync(a) || (Editor.warn(`Mount runtime resource failed, ${a} is not a valid folder.`), a = ""), i()
        }, t => {
            if (!a) return t(), void 0;
            c = `${e.name}-${s.name}`, Editor.assetdb.mount(a, c, {
                readonly: !0
            }, e => {
                e ? Editor.warn(`Mount runtime resource failed. message: ${e.stack}`) : d = !0, t()
            })
        }, e => {
            if (!d || !Editor.assetdbInited) return e(), void 0;
            Editor.assetdb.attachMountPath(c, t => {
                t && Editor.warn(`Attach mount path ${c} failed. message: ${t.stack}`), e()
            })
        }], e => {
            o()
        })
    },
    unloadPackage(e, t) {
        if (e.gizmos)
            for (let t in e.gizmos) delete Editor.gizmos[t];
        e["scene-script"] && (Editor.Ipc.sendToPanel("scene", "scene:unload-package-scene-script", e.name), delete Editor.sceneScripts[e.name]), e["build-template"] && delete Editor.Builder.buildTemplates[e.name];
        var r = e["simple-build-target"];
        if (r) {
            let t = Editor.require(`packages://${e.name}/${r}`);
            delete Editor.Builder.simpleBuildTargets[t.platform], t._ipc && t._ipc.clear()
        }
        if (e.inspector)
            for (let t in e.inspector) delete Editor.inspectors[t];
        var o = e["runtime-resource"];
        if (!o) return t && t(), void 0;
        var n = `${e.name}-${o.name}`;
        i.waterfall([e => {
            Editor.assetdb.unattachMountPath(n, t => {
                t && Editor.warn(`Unattach mount path ${n} failed. message: ${t.stack}`), e(t)
            })
        }, t => {
            Editor.assetdb.unmount(n, i => {
                i && Editor.warn(`Unmount runtime resource of package ${e.name} failed. message : ${i.stack}`), t()
            })
        }], e => {
            t && t()
        })
    }
}), Editor.App.on("focus", function () {
    "test" !== Editor.argv._command && Editor.assetdb.watchOFF()
}), Editor.App.on("blur", function () {
    "test" !== Editor.argv._command && Editor.assetdb.watchON()
}), Editor.App.on("quit", function () {
    Editor.PreviewServer.stop(), Editor.NativeUtils.stop(), process.send && process.send({
        channel: "show-dashboard"
    })
});