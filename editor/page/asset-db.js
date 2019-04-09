"use strict";
let e = {
    remote: Editor.remote.assetdb,
    library: Editor.remote.assetdb.library,
    explore(e) {
        Editor.Ipc.sendToMain("asset-db:explore", e)
    },
    exploreLib(e) {
        Editor.Ipc.sendToMain("asset-db:explore-lib", e)
    },
    queryPathByUrl: (e, s) => Editor.Ipc.sendToMain("asset-db:query-path-by-url", e, s),
    queryUuidByUrl: (e, s) => Editor.Ipc.sendToMain("asset-db:query-uuid-by-url", e, s),
    queryPathByUuid: (e, s) => Editor.Ipc.sendToMain("asset-db:query-path-by-uuid", e, s),
    queryUrlByUuid: (e, s) => Editor.Ipc.sendToMain("asset-db:query-url-by-uuid", e, s),
    queryInfoByUuid: (e, s) => Editor.Ipc.sendToMain("asset-db:query-info-by-uuid", e, s),
    queryMetaInfoByUuid: (e, s) => Editor.Ipc.sendToMain("asset-db:query-meta-info-by-uuid", e, s, 3e4),
    deepQuery: e => Editor.Ipc.sendToMain("asset-db:deep-query", e, -1),
    queryAssets: (e, s, t) => Editor.Ipc.sendToMain("asset-db:query-assets", e, s, t, -1),
    import(e, s, t, d) {
        Editor.Ipc.sendToMain("asset-db:import-assets", e, s, t, d, -1)
    },
    create(e, s, t) {
        Editor.Ipc.sendToMain("asset-db:create-asset", e, s, t)
    },
    move(e, s, t, d) {
        Editor.Ipc.sendToMain("asset-db:move-asset", e, s, t, d)
    },
    delete(e, s) {
        Editor.Ipc.sendToMain("asset-db:delete-assets", e, s)
    },
    saveExists(e, s, t) {
        Editor.Ipc.sendToMain("asset-db:save-exists", e, s, t)
    },
    createOrSave(e, s, t) {
        Editor.Ipc.sendToMain("asset-db:create-or-save", e, s, t)
    },
    saveMeta(e, s, t) {
        Editor.Ipc.sendToMain("asset-db:save-meta", e, s, t)
    },
    refresh(e, s) {
        Editor.Ipc.sendToMain("asset-db:refresh", e, s)
    }
};
const s = Editor.require("app://asset-db/lib/meta");
Editor.metas || (Editor.metas = {}), Editor.metas["raw-asset"] = s.RawAssetMeta, Editor.metas.asset = s.AssetMeta, Editor.metas.folder = s.FolderMeta, Editor.assetdb = e;