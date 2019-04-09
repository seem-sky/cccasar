"use strict";
var e = cc.Font;
const i = !1,
    s = require("path"),
    t = require("fire-fs"),
    r = require("../../share/build-platforms"),
    a = require("../scene-utils/missing-class-reporter").MissingClass,
    o = Editor.require("app://editor/page/build/texture-compress"),
    {
        promisify: l
    } = require("util");
class d {
    constructor(e, i, s) {
        this.writer = e, this.library = i;
        var t = r[s];
        this.platform = s, this.isJSB = t.isNative, this.exportSimpleFormat = !t.stripDefaultValues || t.exportSimpleProject, this.shouldExportScript = !t.exportSimpleProject, this.deserializeDetails = new cc.deserialize.Details, this.existsCache = {}, this._bindedGetAssetRef = this._getAssetRef.bind(this), this.uuid2meta = Editor.remote.assetdb._uuid2meta
    }
    build(e, i) {
        Editor.assetdb.queryInfoByUuid(e, (s, t) => {
            if (!t) return this.existsCache[e] = !1, i(new Error(d.AssetMissing));
            this.existsCache[e] = !0;
            var r = t.type;
            return r ? "folder" === r ? (console.warn("Should not build folder"), i()) : (this._buildAsset(e).then(e => {
                i(null, e)
            }, i), void 0) : i(new Error("Asset type not specified " + t.url))
        })
    }
    async _exportNativeAsset(e) {
        let i = e.nativeUrl;
        var r = s.relative(this.library, i),
            a = s.join(this.writer.dest, "..", "raw-assets", r);
        if (e instanceof cc.Texture2D) {
            let s = this.uuid2meta[e._uuid],
                t = [];
            try {
                t = await l(o)({
                    src: i,
                    dst: a,
                    platform: this.platform,
                    compressOption: s.platformSettings
                })
            } catch (e) {
                Editor.error(e)
            }
            return t.length > 0 && (e._exportedExts = t), void 0
        }
        try {
            await l(t.copy)(i, a)
        } catch (e) {
            return Editor.error("Failed to copy native asset file %s to %s,", i, a, e), void 0
        }
        return a
    }
    _getAssetRef(e) {
        var i = this.existsCache[e];
        return void 0 === i && (i = this.existsCache[e] = !!Editor.assetdb.remote.uuidToFspath(e)), i ? Editor.serialize.asAsset(e) : null
    }
    async _buildAsset(r) {
        var o = s.join(this.library, r.slice(0, 2), r + ".json"),
            d = await l(t.readFile)(o);
        i && console.log("building " + o), this.deserializeDetails.reset(), a.hasMissingClass = !1;
        var n = cc.deserialize(d, this.deserializeDetails, {
            ignoreEditorOnly: !0,
            classFinder: a.classFinder
        });
        n._uuid = r, a.hasMissingClass && this.shouldExportScript && a.reportMissingClass(n), this.deserializeDetails.assignAssetsBy(this._bindedGetAssetRef);
        var u, h, c = this.deserializeDetails.uuidList.slice();
        c.length > 0 && (u = this.deserializeDetails.uuidObjList.slice()), n._native && (this.isJSB || !n.constructor.preventPreloadNativeObject || n instanceof e) && (h = await this._exportNativeAsset(n));
        var p = Editor.serialize(n, {
            exporting: !0,
            nicify: !this.exportSimpleFormat,
            stringify: !1,
            dontStripDefault: this.exportSimpleFormat
        });
        return await this.writer.writeJsonByUuid(r, p), {
            dependUuids: c,
            ownersForDependUuids: u,
            nativePath: h
        }
    }
}
d.AssetMissing = "asset missing", module.exports = d;