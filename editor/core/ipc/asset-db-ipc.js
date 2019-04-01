"use strict";
const t = require("electron"),
    e = t.ipcMain,
    s = require("path");
require("fire-fs");
e.on("asset-db:explore", (e, s) => {
    var i = Editor.assetdb._fspath(s);
    t.shell.showItemInFolder(i)
}), e.on("asset-db:query-path-by-url", (t, e) => {
    t.reply && t.reply(null, Editor.assetdb._fspath(e))
}), e.on("asset-db:query-uuid-by-url", (t, e) => {
    t.reply && t.reply(null, Editor.assetdb.urlToUuid(e))
}), e.on("asset-db:query-path-by-uuid", (t, e) => {
    t.reply && t.reply(null, Editor.assetdb.uuidToFspath(e))
}), e.on("asset-db:query-url-by-uuid", (t, e) => {
    t.reply && t.reply(null, Editor.assetdb.uuidToUrl(e))
}), e.on("asset-db:query-info-by-uuid", (t, e) => {
    t.reply && t.reply(null, Editor.assetdb.assetInfoByUuid(e))
}), e.on("asset-db:query-meta-info-by-uuid", (t, e) => {
    if (!t.reply) return;
    let i = Editor.assetdb.uuidToFspath(e);
    if (i) {
        let d = i + ".meta",
            r = Editor.require("app://asset-db/lib/meta").get(Editor.assetdb, e),
            a = JSON.stringify(r.serialize(), null, 2),
            o = Editor.assetdb.isSubAssetByPath(i),
            u = Editor.assetdb._uuid2mtime[e];
        if (o) {
            let t = Editor.assetdb.fspathToUuid(s.dirname(i));
            u = Editor.assetdb._uuid2mtime[t]
        }
        return t.reply(null, {
            assetType: r.assetType(),
            defaultType: r.constructor.defaultType(),
            assetUrl: Editor.assetdb.uuidToUrl(e),
            assetPath: i,
            metaPath: d,
            metaMtime: u ? u.meta : 0,
            assetMtime: u ? u.asset : 0,
            isSubMeta: o,
            json: a
        }), void 0
    }
    t.reply()
}), e.on("asset-db:deep-query", t => {
    t.reply && Editor.assetdb.deepQuery((e, s) => {
        t.reply(null, s)
    })
}), e.on("asset-db:query-assets", (t, e, s) => {
    t.reply && Editor.assetdb.queryAssets(e, s, (e, s) => {
        t.reply(null, s)
    })
}), e.on("asset-db:query-mounts", t => {
    t.reply && t.reply(null, Editor.assetdb._mounts)
}), e.on("asset-db:import-assets", (t, e, s, i) => {
    i && Editor.Ipc.sendToPanel("assets", "assets:start-refresh"), Editor.assetdb.watchOFF(), Editor.assetdb.import(e, s, (e, s) => {
        t.reply && (e ? t.reply() : t.reply(null, s)), i && Editor.Ipc.sendToPanel("assets", "assets:end-refresh")
    }), Editor.App.focused || Editor.assetdb.watchON()
}), e.on("asset-db:create-asset", (t, e, s) => {
    Editor.assetdb.watchOFF(), Editor.assetdb.create(e, s, t.reply && function (e, s) {
        t.reply(e, s)
    }), Editor.App.focused || Editor.assetdb.watchON()
}), e.on("asset-db:move-asset", (t, e, s, i) => {
    Editor.assetdb.watchOFF(), Editor.assetdb.move(e, s, (d, r) => {
        d && (i ? Editor.Dialog.messageBox({
            type: "warning",
            buttons: [Editor.T("MESSAGE.ok")],
            title: Editor.T("MESSAGE.warning"),
            message: Editor.T("MESSAGE.assets.failed_to_move", {
                srcUrl: e,
                destUrl: s
            }),
            detail: `${d.message}`,
            noLink: !0
        }) : Editor.assetdb.error(Editor.T("MESSAGE.assets.failed_to_move", {
            srcUrl: e,
            destUrl: s
        }) + `messages: ${d.stack}`)), t.reply && t.reply(d, r)
    }), Editor.App.focused || Editor.assetdb.watchON()
}), e.on("asset-db:delete-assets", (t, e) => {
    Editor.assetdb.watchOFF(), Editor.assetdb.delete(e, t.reply && function (e, s) {
        t.reply(e, s)
    }), Editor.App.focused || Editor.assetdb.watchON()
}), e.on("asset-db:save-exists", (t, e, s) => {
    Editor.assetdb.watchOFF(), Editor.assetdb.saveExists(e, s, t.reply && function (e, s) {
        t.reply(e, s)
    }), Editor.App.focused || Editor.assetdb.watchON()
}), e.on("asset-db:create-or-save", (t, e, s) => {
    Editor.assetdb.watchOFF(), Editor.assetdb.exists(e) ? Editor.assetdb.saveExists(e, s, t.reply && function (e, s) {
        t.reply(e, s)
    }) : Editor.assetdb.create(e, s, t.reply && function (e, s) {
        t.reply(e, s)
    }), Editor.App.focused || Editor.assetdb.watchON()
}), e.on("asset-db:save-meta", (t, e, s) => {
    Editor.assetdb.watchOFF(), Editor.assetdb.saveMeta(e, s, t.reply && function () {
        t.reply()
    }), Editor.App.focused || Editor.assetdb.watchON()
}), e.on("asset-db:refresh", (t, e) => {
    Editor.assetdb.watchOFF(), Editor.assetdb.refresh(e, t.reply && function (e, s) {
        t.reply(e, s)
    }), Editor.focused || Editor.assetdb.watchON()
}), e.on("asset-db:attach-mountpath", (t, e) => {
    Editor.assetdb.watchOFF(), Editor.assetdb.attachMountPath(e, t.reply && function (e) {
        t.reply(e)
    }), Editor.focused || Editor.assetdb.watchON()
}), e.on("asset-db:unattach-mountpath", (t, e) => {
    Editor.assetdb.watchOFF(), Editor.assetdb.unattachMountPath(e, t.reply && function (e) {
        t.reply(e)
    }), Editor.focused || Editor.assetdb.watchON()
}), e.on("asset-db:query-watch-state", () => {
    Editor.Ipc.sendToMainWin("asset-db:watch-state-changed", Editor.assetdb.getWatchState())
}), e.on("asset-db:asset-changed", function (t, e) {
    if (Editor.QuickCompiler.isScript(e.type)) {
        var s = Editor.assetdb.uuidToFspath(e.uuid);
        Editor.QuickCompiler.moveScripts([s], [e.uuid])
    }
}), e.on("asset-db:asset-uuid-changed", function (t, e) {
    Editor.QuickCompiler.needCompile(e.type, e.uuid) && Editor.QuickCompiler.scriptUuidChanged(e.oldUuid, e.uuid)
}), e.on("asset-db:assets-moved", function (t, e) {
    var s = !1,
        i = !1,
        d = [],
        r = [];
    e.forEach(function (t) {
        var e = Editor.assetdb.assetInfoByUuid(t.uuid).type;
        Editor.QuickCompiler.needCompile(e, t.uuid) && (r.push(t.uuid), d.push(t.srcPath), s = !0), !s && Editor.QuickCompiler.isScript(e) && (i = !0), "scene" === e && t.uuid === Editor.currentSceneUuid && Editor.Ipc.sendToMain("scene:update-title")
    }), s ? Editor.QuickCompiler.moveScripts(d, r) : i && Editor.QuickCompiler.reloadScripts()
}), e.on("asset-db:assets-created", function (t, e) {
    var s = !1,
        i = !1,
        d = [];
    e.forEach(function (t) {
        var e = Editor.assetdb.assetInfoByUuid(t.uuid).type;
        Editor.QuickCompiler.needCompile(e, t.uuid) && (d.push(t.uuid), s = !0), !s && Editor.QuickCompiler.isScript(e) && (i = !0), "scene" === e && (Editor.sceneList.push(t.uuid), t.uuid === Editor.currentSceneUuid && Editor.Ipc.sendToMain("scene:update-title"))
    }), s ? Editor.QuickCompiler.compileScripts(d) : i && Editor.QuickCompiler.reloadScripts()
}), e.on("asset-db:assets-deleted", function (t, e) {
    var s = !1,
        i = !1,
        d = [],
        r = [];
    e.forEach(function (t) {
        var e = Editor.assetdb.assetInfoByPath(t.path, t.uuid).type;
        if (Editor.QuickCompiler.needCompile(e, t.uuid) && (d.push(t.path), r.push(t.uuid), s = !0), !s && Editor.QuickCompiler.isScript(e) && (i = !0), "scene" === e) {
            var a = Editor.sceneList.indexOf(t.uuid); - 1 !== a && Editor.sceneList.splice(a, 1), t.uuid === Editor.currentSceneUuid && (Editor.Ipc.sendToMain("scene:set-current-scene", null, () => {}), Editor.Ipc.sendToMain("scene:update-title"))
        }
    }), s ? Editor.QuickCompiler.removeScripts(d, r) : i && Editor.QuickCompiler.reloadScripts()
}), e.on("asset-db:script-import-failed", function (t, e) {
    e.error && Editor.QuickCompiler.singleScriptCompileFailed(e)
}), e.on("asset-db:meta-backup", (e, i) => {
    if (!Editor.App._profile.data["show-meta-backup-dialog"]) return;
    let d = s.normalize(s.join(Editor.Project.path, Editor.metaBackupPath)),
        r = Editor.T("MESSAGE.assets.meta_backup_detail", {
            backupPath: d
        });
    i.forEach((t, e) => {
        r += "\n" + (e + 1) + ". " + t
    });
    let a = Editor.Dialog.messageBox({
        type: "warning",
        buttons: [Editor.T("MESSAGE.ok"), Editor.T("MESSAGE.assets.meta_backup_help"), Editor.T("MESSAGE.assets.meta_backup_never_show")],
        message: Editor.T("MESSAGE.assets.meta_backup_msg"),
        detail: r,
        noLink: !0,
        defaultId: 0
    });
    1 === a ? t.shell.openExternal(Editor.T("MESSAGE.assets.meta_backup_help_url")) : 2 === a && (Editor.App._profile.data["show-meta-backup-dialog"] = !1, Editor.App._profile.save())
});