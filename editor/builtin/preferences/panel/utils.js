"use strict";
const e = require("fire-fs"),
    {
        dirname: t,
        join: i
    } = require("path"),
    r = Editor.require("app://share/engine-utils");
let o = r.getSimulatorConfig();
exports.profiles = {
    global: null
}, exports.init = function () {
    return Promise.resolve().then(() => new Promise((e, t) => {
        Editor.Profile.load("profile://global/settings.json", (i, r) => {
            if (i) return t(i);
            exports.profiles.global = r, e()
        })
    }))
}, exports.save = function () {
    exports.profiles.global.save();
    let i = Editor.url(r.builtinSimulatorCfgPath);
    if (!e.existsSync(t(i))) return Editor.warn("Sorry, save failed. Cannot find simulator config.json under " + i), void 0;
    e.writeJsonSync(i, o, "utf-8")
};
exports.queryGeneral = function () {
    let e = exports.profiles.global.data || {};
    return {
        language: e.language,
        nodeState: e["node-tree-state"],
        ip: e["local-ip"],
        log: e["show-console-log"],
        step: e.step,
        metaBackupDialog: e["show-meta-backup-dialog"],
        autoTrimImage: e["trim-imported-image"],
        autoSyncPrefab: e["auto-sync-prefab"]
    }
}, exports.queryEditor = function () {
    let e = exports.profiles.global.data || {};
    return {
        sctiptEditorList: JSON.parse(JSON.stringify(e["script-editor-list"])),
        autoCompilerScript: e["auto-compiler-scripts"],
        customizeScriptEditor: e["script-editor"],
        customizePictureEditor: e["picture-editor-root"]
    }
}, exports.queryNative = function () {
    let e = exports.profiles.global.data || {};
    return {
        useDefaultJsEngine: e["use-default-js-engine"],
        jsEnginePath: e["js-engine-path"],
        useDefaultCppEngine: e["use-default-cpp-engine"],
        cppEnginePath: e["cpp-engine-path"],
        weChatPath: e["wechatgame-app-path"],
        ndkPath: e["ndk-root"],
        sdkPath: e["android-sdk-root"],
        watchJsEngine: e["watch-js-engine"]
    }
}, exports.queryPreview = function () {
    let e = exports.profiles.global.data || {},
        t = [],
        i = o.simulator_screen_size;
    o && i && (i.forEach((e, i) => {
        t.push({
            value: i + "",
            width: e.width,
            height: e.height,
            title: e.title
        })
    }), t.push({
        value: i.length + "",
        title: Editor.T("PREFERENCES.sim_res_custom"),
        custom: !0
    }));
    let r = {
        width: o.init_cfg.width,
        height: o.init_cfg.height
    };
    return {
        autoRefresh: e["auto-refresh"],
        simulatorDebugger: e["simulator-debugger"],
        previewBrowserList: e["preview-browser-list"],
        previewBrowser: e["preview-browser"],
        isLandscape: e["simulator-orientation"],
        resolution: e["simulator-resolution"],
        customizeSize: r,
        simulatorPath: o ? Editor.url("unpack://simulator/") : "",
        simulatorWaitForConnect: o && o.init_cfg.waitForConnect || !1,
        resolutionList: t
    }
};
exports.setGeneral = function (e) {
    let t = exports.profiles.global.data;
    t || (t = exports.profiles.global.data = {}), t.language !== e.language && Editor.Dialog.messageBox({
        type: "info",
        buttons: [Editor.T("MESSAGE.preferences.ok")],
        title: Editor.T("MESSAGE.preferences.hint_title"),
        message: Editor.T("MESSAGE.preferences.hint_message"),
        detail: Editor.T("MESSAGE.preferences.hint_detail"),
        defaultId: 0,
        cancelId: 0,
        noLink: !0
    }), t.language = e.language, t["node-tree-state"] = parseInt(e.nodeState), t["local-ip"] = parseInt(e.ip), t["show-console-log"] = e.log, t.step = e.step, t["show-meta-backup-dialog"] = e.metaBackupDialog, t["trim-imported-image"] = e.autoTrimImage, t["auto-sync-prefab"] = e.autoSyncPrefab
}, exports.setEditor = function (e) {
    let t = exports.profiles.global.data;
    t || (t = exports.profiles.global.data = {}), t["script-editor-list"] = JSON.parse(JSON.stringify(e.sctiptEditorList)), t["auto-compiler-scripts"] = e.autoCompilerScript, t["script-editor"] = e.customizeScriptEditor, t["picture-editor-root"] = e.customizePictureEditor
}, exports.setNative = function (e) {
    let t = exports.profiles.global.data;
    t || (t = exports.profiles.global.data = {}), t["use-default-js-engine"] = e.useDefaultJsEngine, t["js-engine-path"] = e.jsEnginePath, t["use-default-cpp-engine"] = e.useDefaultCppEngine, t["cpp-engine-path"] = e.cppEnginePath, t["wechatgame-app-path"] = e.weChatPath, t["ndk-root"] = e.ndkPath, t["android-sdk-root"] = e.sdkPath, t["watch-js-engine"] = e.watchJsEngine
}, exports.setPreview = function (e) {
    let t = exports.profiles.global.data;
    t || (t = exports.profiles.global.data = {}), "string" == typeof e.isLandscape && (e.isLandscape = "true" === e.isLandscape), t["auto-refresh"] = e.autoRefresh, t["simulator-debugger"] = e.simulatorDebugger, t["preview-browser-list"] = e.previewBrowserList, t["preview-browser"] = e.previewBrowser, t["simulator-orientation"] = e.isLandscape, t["simulator-resolution"] = parseInt(e.resolution), o.init_cfg.width = parseInt(e.customizeSize.width), o.init_cfg.height = parseInt(e.customizeSize.height), o.init_cfg.isLandscape = e.isLandscape, o.init_cfg.waitForConnect = e.simulatorWaitForConnect
};