var e = require("fire-fs"),
    t = require("fire-path"),
    r = require("async"),
    s = require("../utils"),
    i = require("../lib/jszip.min"),
    n = require("../lib/jszip-utils.min"),
    a = require("node-uuid");
let o = function (e, r) {
        let s = t.parse(e);
        this.name = s.name + s.ext, this.path = e, this.type = "", this.icon = "", this.selected = !0, this.parent = r
    },
    h = function (e, r) {
        let s = t.parse(e);
        this.name = s.name, this.path = e, this.children = [], this.type = "directory", this.folded = !0, this.selected = !0, this.parent = r
    };
let l = Editor.T("IMPORT_ASSET.parse_zip_err_title"),
    d = Editor.T("IMPORT_ASSET.parse_zip_err_content");
Editor.T("IMPORT_ASSET.err_title");
module.exports = {
    tempPath: t.join(Editor.Project.path, "temp", "packageAsset", "/"),
    _onInit(e) {
        this._folderArr = [], this._assetTypeArr = [], this._imgArr = [], this._treeRoot = new h(e), this._basePath = e, this._outPath = "", this._conflictAssets = []
    },
    _getFolderInfo(e) {
        return this._folderArr[e]
    },
    _getParent(e) {
        let r = t.parse(e);
        if (!r.dir) return null;
        let s = this._getFolderInfo(r.dir);
        return s || this._getParent(r.dir)
    },
    _getTypeByName(e) {
        return this._assetTypeArr[e]
    },
    _getIcon(e, t) {
        return "texture" === t || "sprite-frame" === t ? this._imgArr[e] : "unpack://static/icon/assets/" + t + ".png"
    },
    _addAsset(e, r) {
        let s = t.parse(e);
        if (!s.dir && r)
            if (s.ext) {
                let t = new o(e, r); - 1 === r.children.indexOf(t) && (t.type = this._getTypeByName(t.name), t.icon = this._getIcon(t.name, t.type), r.children.push(t))
            } else {
                let t = new h(e, r); - 1 === r.children.indexOf(t) && (r.children.push(t), this._folderArr[s.name] = t)
            }
        else {
            let t = this._getFolderInfo(s.dir);
            if (t || (t = new h(s.dir, this._getParent(s.dir)), this._folderArr[s.dir] = s), s.ext) {
                let r = new o(e, t); - 1 === t.children.indexOf(r) && (r.type = this._getTypeByName(r.name), r.icon = this._getIcon(r.name, r.type), t.children.push(r))
            } else {
                let r = new h(e, t);
                if (-1 === t.children.indexOf(r)) {
                    t.children.push(r);
                    let e = s.dir + "/" + s.name;
                    this._folderArr[e] = r
                }
            }
        }
    },
    _addImageAsset(e, r) {
        let s = t.parse(e.name);
        e.async("arraybuffer").then(t => {
            let i = function (e) {
                    let t = "",
                        r = new Uint8Array(e),
                        s = r.byteLength;
                    for (let e = 0; e < s; e++) t += String.fromCharCode(r[e]);
                    return window.btoa(t)
                }(t),
                n = e.name.indexOf("."),
                a = e.name.substr(n + 1);
            this._imgArr[s.name + s.ext] = "data:image/" + a + ";base64," + i, this._addAsset(e.name, r)
        })
    },
    _analyticalContent(e, r) {
        let i = t.parse(e.name);
        i.base === s.ASSET_TYPE || ".meta" === i.ext || (".png" === i.ext || ".jpg" === i.ext ? this._addImageAsset(e, this._treeRoot) : this._addAsset(e.name, this._treeRoot)), r()
    },
    _analyticalZip(e, t) {
        n.getBinaryContent(e, (e, n) => {
            if (e) return t && t(e), void 0;
            i.loadAsync(n).then(e => {
                try {
                    e.file(s.ASSET_TYPE).async("string").then(s => {
                        this._assetTypeArr = JSON.parse(s), r.each(e.files, (e, t) => {
                            this._analyticalContent(e, t)
                        }, t)
                    })
                } catch (e) {
                    s.showErrorMessageBox(l, d), t && t(d)
                }
            }, e => {
                s.showErrorMessageBox(l, d), t && t(d)
            })
        })
    },
    analyticalZip(e, t) {
        this._onInit(e), this._analyticalZip(e, e => {
            if (e) return t(e, null);
            t(null, this._treeRoot)
        })
    },
    _addNeedImport(e, t, s) {
        e.selected && (t[e.name] = e, t[e.name + ".meta"] = e), r.each(e.children, (r, s) => {
            if (r.selected && (t[r.name] = r, t[r.name + ".meta"] = e), "directory" !== r.type) return s();
            this._addNeedImport(r, t, s)
        }, s)
    },
    _queryNeedImportAsset(e, t) {
        let s = [];
        r.each(e.children, (e, t) => {
            this._addNeedImport(e, s, t)
        }, () => {
            t(null, s)
        })
    },
    _importContent(r, s, i) {
        let n = t.parse(r.name),
            a = t.join(this._outPath, r.name);
        if (".meta" === n.ext) {
            let t = Object.keys(s);
            r.async("string").then(r => {
                e.writeFileSync(a, r), t.forEach(t => {
                    if (e.existsSync(a) && (r = e.readFileSync(a, "utf8")), -1 !== r.indexOf(t)) {
                        let i = new RegExp(t, "g");
                        r = r.replace(i, s[t]), e.writeFileSync(a, r)
                    }
                }), i()
            })
        } else if (".prefab" === n.ext || ".fire" === n.ext || ".anim" === n.ext) {
            let t = Object.keys(s);
            r.async("string").then(r => {
                e.writeFileSync(a, r), t.forEach(t => {
                    if (e.existsSync(a) && (r = e.readFileSync(a, "utf8")), -1 !== r.indexOf(t)) {
                        let i = new RegExp(t, "g");
                        r = r.replace(i, s[t]), e.writeFileSync(a, r)
                    }
                }), i()
            })
        }
    },
    _checkMeta(e, s, i) {
        let n = [];
        r.each(e, (e, r) => {
            let i = t.parse(e.name),
                o = s[i.name + i.ext];
            ".meta" === i.ext && o ? e.async("string").then(e => {
                let s = JSON.parse(e),
                    o = Editor.remote.assetdb.uuidToFspath(s.uuid);
                if (o) {
                    if (o !== t.join(this._outPath, i.dir, i.name)) {
                        n[s.uuid] = a.v4(), Object.keys(s.subMetas).forEach(e => {
                            let t = s.subMetas[e];
                            n[t.uuid] = a.v4()
                        })
                    }
                }
                r()
            }) : r()
        }, () => {
            i(null, n)
        })
    },
    _importAssets(a, o) {
        n.getBinaryContent(this._basePath, (n, h) => {
            n || i.loadAsync(h).then(i => {
                try {
                    let n = i.files,
                        h = Object.keys(n);
                    if (0 === h.length) return;
                    this._progressInfo.total = h.length, this._checkMeta(n, a, (i, h) => {
                        let l = Editor.T("IMPORT_ASSET.confirmation_box_title"),
                            d = Editor.T("IMPORT_ASSET.confirmation_box_content", {
                                outPath: this._outPath
                            });
                        s.showImportMessageBox(l, d, (i, l) => {
                            !i && l && r.each(n, (r, i) => {
                                let n = t.parse(r.name);
                                if (a[n.name + n.ext]) {
                                    let a = t.join(this._outPath, r.name);
                                    r.dir ? (s.createFolder(t.join(t.dirname(a), n.name)), this._updatePorgress(r), i()) : ".meta" !== n.ext && ".prefab" !== n.ext && ".fire" !== n.ext && ".anim" !== n.ext ? r.nodeStream().pipe(e.createWriteStream(a)).on("finish", () => {
                                        this._updatePorgress(r), i()
                                    }) : this._importContent(r, h, () => {
                                        this._updatePorgress(r), i()
                                    })
                                } else i()
                            }, o)
                        })
                    })
                } catch (e) {
                    s.showErrorMessageBox(l, d), o && o(d)
                }
            })
        })
    },
    importZip(t, r, i) {
        if (this._outPath = t, this._initPorgress(i), !e.existsSync(t)) {
            let e = Editor.T("IMPORT_ASSET.err_title"),
                r = Editor.T("IMPORT_ASSET.err_info_not_exist", {
                    outPath: t
                });
            return s.showErrorMessageBox(e, r), void 0
        }
        this._queryNeedImportAsset(r, (e, t) => {
            this._importAssets(t, () => {
                this._completePorgress(), Editor.assetdb.refresh("db://assets/")
            })
        })
    },
    _initPorgress(e) {
        this._progressInfo = {
            curProgress: 0,
            total: 0,
            outStrLog: ""
        }, this._progressCallback = e
    },
    _updatePorgress(e) {
        let t = (e.dir ? Editor.T("IMPORT_ASSET.folder") : Editor.T("IMPORT_ASSET.file")) + " " + e.name;
        this._progressInfo.outStrLog = Editor.T("IMPORT_ASSET.progress_state_import", {
            name: t
        }), this._progressInfo.curProgress++, this._sendPorgressCallback()
    },
    _sendPorgressCallback() {
        this._progressCallback(this._progressInfo)
    },
    _completePorgress() {
        this._progressInfo.curProgress = this._progressInfo.total, this._progressInfo.outStrLog = Editor.T("IMPORT_ASSET.progress_state_end"), this._sendPorgressCallback()
    }
};