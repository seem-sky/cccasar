const e = require("fire-fs"),
    t = require("fire-path"),
    s = require("fire-url"),
    i = Editor.require("packages://assets/panel/utils/event"),
    a = Editor.require("packages://assets/panel/utils/cache"),
    r = Editor.require("packages://assets/panel/utils/operation"),
    o = Editor.require("packages://assets/panel/utils/utils");
let n = t.join(Editor.Project.path, "/settings/project.json"),
    l = function (e) {
        return e.length <= 1 ? e[0] : e[e.length - 1]
    },
    d = function (e, t) {
        let s = Editor.Selection.curSelection("asset"),
            i = l(s),
            a = t[t.findIndex(e => e.id === i) + ("down" === e ? 1 : -1)];
        a && Editor.Selection.select("asset", [a.id], !0, !0)
    },
    u = function (e) {
        let t = a.queryShowNodes(),
            s = Editor.Selection.curSelection("asset"),
            i = l(s),
            r = s.indexOf(i),
            o = t.findIndex(e => e.id === i),
            n = t[o],
            d = t[o + ("down" === e ? 1 : -1)];
        d && (d.selected ? (n.selected = !n.selected, s.splice(r, 1)) : (d.selected = !d.selected, d.selected ? s.push(d.id) : s.forEach((e, t) => {
            e === d.id && s.splice(t, 1)
        })), Editor.Selection.select("asset", s, !0, !0))
    };
Editor.Panel.extend({
    listeners: {
        "panel-resize"() {
            this._vm.length = (this.clientHeight - 56) / a.lineHeight + 3
        }
    },
    style: e.readFileSync(Editor.url("packages://assets/panel/style/index.css")),
    template: e.readFileSync(Editor.url("packages://assets/panel/template/index.html")),
    ready() {
        this._vm = function (e, t) {
            return new Vue({
                el: e,
                data: {
                    length: 0,
                    filter: "",
                    currentPath: "db://",
                    loading: !0
                },
                watch: {},
                methods: {},
                components: {
                    tools: Editor.require("packages://assets/panel/component/tools"),
                    nodes: Editor.require("packages://assets/panel/component/nodes"),
                    search: Editor.require("packages://assets/panel/component/search")
                },
                created() {
                    r.loadAssets(), i.on("filter-changed", e => {
                        this.filter = e
                    }), i.on("start-loading", () => {
                        this.loading = !0
                    }), i.on("finish-loading", () => {
                        this.loading = !1
                    }), i.on("empty-filter", () => {
                        let e = Editor.Selection.curSelection("asset");
                        e.length > 0 && this.$refs.nodes.scrollToItem(e[0])
                    })
                }
            })
        }(this.shadowRoot), this._vm.length = (this.clientHeight - 56) / a.lineHeight + 3
    },
    messages: {
        "assets:copy"(e, t) {
            let s = Editor.Selection.curSelection("asset"); - 1 === s.indexOf(t) ? this._copyUuids = [t] : this._copyUuids = s
        },
        async "assets:paste"(e, s) {
            let i = await o.uuid2path(s);
            if (!await o.isDir(i) && (i = t.dirname(i), !await o.isDir(i))) return Editor.warn("The selected location is not a folder.");
            if (this._copyUuids && await o.exists(i))
                for (let e = 0; e < this._copyUuids.length; e++) {
                    let s = this._copyUuids[e];
                    if (await o.isReadOnly(s)) return;
                    let a = await o.uuid2path(s);
                    if (!a) return Editor.warn(`File is missing - ${s}`);
                    let r = t.basename(a),
                        n = t.join(i, r);
                    if (o.isSubDir(t.dirname(n), t.dirname(a))) return Editor.warn(`Cannot place directory into itself - ${s}`);
                    if (!(n = await o.copy(a, n))) return;
                    let l = t.relative(Editor.url("db://assets"), n);
                    Editor.assetdb.refresh(`db://assets/${l}`)
                }
        },
        "assets:end-refresh"(e) {
            this.hideLoader()
        },
        "assets:start-refresh"(e) {
            this.showLoaderAfter(100)
        },
        "selection:selected"(e, t, s) {
            if ("asset" !== t || !s) return;
            let i = l(s);
            this._vm.currentPath = r.getRealUrl(i), s.forEach(e => {
                r.select(e, !0)
            }), this._vm.filter ? this._vm.$refs.search.scrollIfNeeded(i) : this._vm.$refs.nodes.scrollIfNeeded(i)
        },
        "change-filter"(e, t) {
            this._vm.filter = t
        },
        "selection:unselected"(e, t, s) {
            "asset" === t && s.forEach(e => {
                r.select(e, !1)
            })
        },
        "asset-db:assets-created"(e, s) {
            let i = [];
            if (s.forEach(e => {
                    if (e.hidden) return;
                    let a = t.basenameNoExt(e.path),
                        o = t.extname(e.path);
                    "folder" === e.type ? (a = t.basename(e.path), o = "") : "mount" === e.type && (a = e.name, o = ""), r.add({
                        name: a,
                        extname: o,
                        type: e.type,
                        isSubAsset: e.isSubAsset,
                        readonly: e.readonly,
                        hidden: !1,
                        parentUuid: e.parentUuid,
                        uuid: e.uuid
                    }), this._activeWhenCreated === e.url && (this._activeWhenCreated = null, Editor.Selection.select("asset", e.uuid)), s.some(t => t.uuid === e.parentUuid) || i.push(e)
                }), i.forEach(e => {
                    window.requestAnimationFrame(() => {
                        r.hint(e.uuid);
                        let t = a.queryNode(e.uuid);
                        t && t.parent && r.fold(t.parent, !1)
                    })
                }), i.length) {
                let e = i[0];
                this._vm.$refs.nodes.scrollToItem(e.uuid)
            }
        },
        "asset-db:assets-moved"(e, s) {
            let i = Editor.Utils.arrayCmpFilter(s, (e, s) => t.contains(e.srcPath, s.srcPath) ? 1 : t.contains(s.srcPath, e.srcPath) ? -1 : 0);
            i.forEach(e => {
                Editor.assetdb.queryInfoByUuid(e.uuid, (s, i) => {
                    let a = "";
                    a = "folder" === i.type ? t.basename(e.destPath) : t.basenameNoExt(e.destPath), r.move(e.uuid, e.parentUuid, a)
                })
            }), i.forEach(e => {
                window.requestAnimationFrame(() => {
                    r.hint(e.uuid)
                })
            })
        },
        "asset-db:assets-deleted"(e, t) {
            t.forEach(e => {
                r.remove(e.uuid)
            });
            let s = t.map(e => e.uuid);
            Editor.Selection.unselect("asset", s, !0)
        },
        "asset-db:asset-changed"(e, t) {
            r.hint(t.uuid), "texture" !== t.type && "sprite-frame" !== t.type || r.updateIcon(t.uuid)
        },
        "asset-db:asset-uuid-changed"(e, t) {
            r.updateUuid(t.oldUuid, t.uuid)
        },
        "assets:hint"(e, t) {
            this._vm.$refs.nodes.scrollToItem(t)
        },
        "assets:search"(e, t) {
            this._vm.filter = t
        },
        "assets:clearSearch"(e) {
            this._vm.filter = ""
        },
        "assets:new-asset"(i, o, l) {
            let d, u, c;
            if (l) {
                let e = Editor.Selection.contexts("asset");
                if (e.length > 0) {
                    let s = e[0];
                    "folder" === (u = a.queryNode(s)).assetType || "mount" === u.assetType ? c = r.getRealUrl(u.id) : (d = r.getRealUrl(u.id), c = t.dirname(d))
                } else c = "db://assets"
            } else {
                let e = Editor.Selection.curActivate("asset");
                if (e) {
                    u = a.queryNode(e), d = r.getRealUrl(e), c = "mount" === u.assetType || u === a.queryRoot() ? d : t.dirname(d)
                } else c = "db://assets"
            }
            let h = () => {
                    this._activeWhenCreated = f, Editor.assetdb.create(f, p, function (e, t) {
                        setTimeout(function () {
                            if (!t) return;
                            let e = t[0].uuid;
                            Editor.Selection.select("asset", e, !0, !0), a.queryNode(e) && r.rename(e)
                        }, 50)
                    })
                },
                p = o.data;
            o.url && (p = e.readFileSync(Editor.url(o.url), {
                encoding: "utf8"
            }));
            let f = s.join(c, o.name);
            if (".fire" === s.extname(f)) {
                let t = e.readFileSync(n, "utf-8");
                t = JSON.parse(t), (p = JSON.parse(p)).forEach(e => {
                    "cc.Canvas" === e.__type__ && (e._designResolution = {
                        __type__: "cc.Size",
                        width: t["design-resolution-width"],
                        height: t["design-resolution-height"]
                    }, e._fitWidth = t["fit-width"], e._fitHeight = t["fit-height"])
                }), p = JSON.stringify(p), h()
            } else h()
        },
        "assets:find-usages"(e, t) {
            this._vm.filter = "used:" + t
        },
        "assets:rename"(e, t) {
            r.rename(t)
        },
        "assets:delete"(e, t) {
            this._delete(t)
        }
    },
    selectAll(e) {
        e && (e.stopPropagation(), e.preventDefault());
        let t = a.queryShowNodes().map(e => e.id);
        Editor.Selection.select("asset", t, !0, !0)
    },
    showLoaderAfter(e) {
        this._vm.loading || this._loaderID || (this._loaderID = setTimeout(() => {
            this._vm.loading = !0, this._loaderID = null
        }, e))
    },
    hideLoader() {
        this._vm.loading = !1, clearTimeout(this._loaderID)
    },
    find(e) {},
    delete(e) {
        e && (e.stopPropagation(), e.preventDefault());
        let t = Editor.Selection.curSelection("asset");
        this._delete(t)
    },
    f2(e) {
        e && (e.stopPropagation(), e.preventDefault());
        let t = Editor.Selection.curSelection("asset");
        if (0 === t.length) return;
        let s = l(t);
        r.rename(s)
    },
    left(e) {
        e && (e.stopPropagation(), e.preventDefault());
        let t = Editor.Selection.curSelection("asset"),
            s = l(t);
        r.fold(s, !0)
    },
    right(e) {
        e && (e.stopPropagation(), e.preventDefault());
        let t = Editor.Selection.curSelection("asset"),
            s = l(t);
        r.fold(s, !1)
    },
    async copyFile(e) {
        e && (e.stopPropagation(), e.preventDefault()), this._copyUuids = null;
        let t = [],
            s = Editor.Selection.curSelection("asset");
        for (let e = 0; e < s.length; e++) await o.isReadOnly(s[e]) || t.push(s[e]);
        this._copyUuids = t.length > 0 ? t : null
    },
    async pasteFile(e) {
        e && (e.stopPropagation(), e.preventDefault());
        let s = Editor.Selection.curActivate("asset"),
            i = "";
        if ("mount-assets" === s ? i = Editor.url("db://assets") : Editor.Utils.UuidUtils.isUuid(s) && (i = await o.uuid2path(s)), !await o.isDir(i) && (i = t.dirname(i), !await o.isDir(i))) return Editor.warn("The selected location is not a folder.");
        if (this._copyUuids && await o.exists(i))
            for (let e = 0; e < this._copyUuids.length; e++) {
                let s = this._copyUuids[e];
                if (await o.isReadOnly(s)) return;
                let a = await o.uuid2path(s);
                if (!a) return Editor.warn(`File is missing - ${s}`);
                let r = t.basename(a),
                    n = t.join(i, r);
                if (o.isSubDir(t.dirname(n), t.dirname(a))) return Editor.warn(`Cannot place directory into itself - ${s}`);
                if (!(n = await o.copy(a, n))) return;
                let l = t.relative(Editor.url("db://assets"), n);
                Editor.assetdb.refresh(`db://assets/${l}`)
            }
    },
    shiftUp(e) {
        e && (e.stopPropagation(), e.preventDefault()), u("up")
    },
    shiftDown(e) {
        e && (e.stopPropagation(), e.preventDefault()), u("down")
    },
    up(e) {
        e && (e.stopPropagation(), e.preventDefault()), d("up", this._vm.filter ? this._vm.$refs.search.showList : a.queryShowNodes())
    },
    down(e) {
        e && (e.stopPropagation(), e.preventDefault()), d("down", this._vm.filter ? this._vm.$refs.search.showList : a.queryShowNodes())
    },
    _delete(e) {
        let t = e.map(e => r.getRealUrl(e)),
            s = t;
        s.length > 3 && (s = s.slice(0, 3)).push("..."), s = s.join("\n"), 0 === Editor.Dialog.messageBox({
            type: "warning",
            buttons: [Editor.T("MESSAGE.delete"), Editor.T("MESSAGE.cancel")],
            title: Editor.T("MESSAGE.assets.delete_title"),
            message: Editor.T("MESSAGE.assets.delete_message") + "\n" + s,
            detail: Editor.T("MESSAGE.assets.delete_detail"),
            defaultId: 0,
            cancelId: 1,
            noLink: !0
        }) && Editor.assetdb.delete(t)
    }
});