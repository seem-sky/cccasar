"use strict";
const e = Editor;
let r = e.argv;
e._buildCommand = r.build, e._compileCommand = r.compile, e.showInternalMount = e.dev && !!r.internal, e.Network = require("../network"), e.Project = require("../project"), require("../profile"), e.Engine = require("../engine"), e.AssetDB = require("../asset-db"), e.assetdb = e.AssetDB.assetdb, require("../i18n"), require("../protocol"), e.PreviewServer = require("../preview-server"), e.Metrics = require("../../../share/metrics"), e.Scene = require("../../share/editor-scene"), e.Compiler = require("../../core/compiler"), e.QuickCompiler = require("../../core/quick-compiler"), e.Builder = require("../builder"), e.NativeUtils = require("../../core/native-utils"), e.isBuilder = !1, e.stashedScene = null, require("../../core/ipc"), require("../../core/create-package.js"), require("../windows"), require("../../share/editor-utils"), e.User = require("../../../share/user"), e.assets || (e.assets = {}), e.metas || (e.metas = {}), e.inspectors || (e.inspectors = {}), e.properties || (e.properties = {}), e.assettype2name || (e.assettype2name = {}), e.gizmos = {}, e.sceneScripts = {}, e.init({
    profile: {
        global: e.App.home
    },
    i18n: require(`../../../share/i18n/${e.lang}/localization`),
    "main-menu": require("../../core/main-menu"),
    "panel-window": "unpack://static/window.html",
    layout: "unpack://static/layout/landscape.json",
    selection: ["asset", "node"],
    "package-search-path": [e.dev ? "app://builtin" : "app://../builtin", "app://editor/builtin"],
    theme: "default",
    "theme-search-path": ["app://themes"]
}), e.Profile.setDefault("profile://global/updates.json", {
    "received-ids": [],
    "installed-hotupdates": []
}), e.projectInfo = {
    get name() {
        return Editor.warn("'Editor.projectInfo.name' has been deprecated, please use 'Editor.Project.name'."), e.Project.name
    },
    get path() {
        return Editor.warn("'Editor.projectInfo.path' has been deprecated, please use 'Editor.Project.path'."), e.Project.path
    }
}, module.exports = e;