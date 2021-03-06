"use strict";
const {
    promisify: i
} = require("util"), t = require("path"), r = require("electron");
process.on("unhandledRejection", i => {
    console.error(i)
}), exports.startup = async function (i, t) {
    if (require("./init"), global.Editor = require("./lib/editor"), await Editor.Network.update(), Editor.Network.isOnline && !Editor.argv.nologin || Editor.User.enable(!1), !Editor.argv._command) try {
        await Editor.Project.check(), await Editor.Project.init()
    } catch (i) {
        return t(i), void 0
    }
    try {
        await Editor.Engine.build(), await Editor.Engine.init(), await Editor.Engine.initExtends()
    } catch (i) {
        return t(i)
    }
    await e();
    try {
        await o()
    } catch (i) {
        return t(i)
    }
    try {
        Editor.AssetDB.loading = !0, await Editor.AssetDB.mountInternal(), await Editor.AssetDB.mountExternal(), await Editor.AssetDB.mountMain(), await Editor.AssetDB.init(), Editor.AssetDB.loading = !1
    } catch (i) {
        return Editor.AssetDB.loading = !1, t(i)
    }
    let a = require("../share/engine-utils");
    Editor.builtinCocosRoot = a.getEnginePath();
    try {
        await Editor.Engine.initSceneList()
    } catch (i) {
        return t(i)
    }
    return Editor.MainMenu.add(Editor.T("MAIN_MENU.node.title"), Editor.Menu.getMenu("create-node")), await new Promise((i, t) => {
        Editor.QuickCompiler.init(i)
    }), "string" == typeof Editor._buildCommand ? (await new Promise((i, t) => {
        Editor.Builder.buildCommand(Editor._buildCommand, e => {
            if (e) return Editor.error(e), r.app.exit(1), t(error), void 0;
            r.app.quit(), i()
        })
    }), void 0) : "string" == typeof Editor._compileCommand ? (Editor.Builder.compileCommand(Editor._compileCommand, i => {
        if (i) return Editor.error(i), r.app.exit(1), reject(error), void 0;
        r.app.quit(), resolve()
    }), void 0) : (t(), void 0)
};
let e = async function () {
    if (Editor.argv._command) return;
    let r = t.join(Editor.App.path, "editor", "builtin");
    Editor.log("Loading editor/builtin packages from " + r), await i(Editor.loadPackagesAt(r)), r = t.join(Editor.App.path, Editor.dev ? "" : "..", "builtin"), Editor.log("Loading builtin packages from " + r), await i(Editor.loadPackagesAt(r))
}, o = function () {
    if (!Editor.argv._command) try {
        require("./share/register-builtin-assets"), require("./core/init-builtin-assets")
    } catch (i) {
        Editor.Dialog.messageBox({
            type: "error",
            buttons: ["OK"],
            title: "Register builtin assets failed",
            message: "Maybe the reason is: You are using custom JS engine and it is out-dated.",
            detail: `Error call stack : ${i.stack}`,
            defaultId: 0,
            cancelId: 0,
            noLink: !0
        }), callback(i)
    }
};