"use strict";
const e = require("fire-fs"),
    t = require("fire-path"),
    i = require("async"),
    a = require("globby"),
    r = require("minimatch"),
    n = require("del"),
    o = require("lodash"),
    s = require("./meta");
let u = {};

function l(e, r, o) {
    let s = e._uuidToImportPathNoExt(r);
    i.series([e => {
        n([s, s + ".*"], {
            force: !0
        }, e)
    }, e => {
        let i = t.dirname(s),
            r = t.join(i, "**/*");
        a(r, (a, r) => {
            0 === (r = r.map(e => t.normalize(e))).length ? n(i, {
                force: !0
            }, e) : e()
        })
    }, t => {
        let a = e.subAssetInfosByUuid(r);
        i.each(a, (t, i) => {
            let a = t.uuid;
            l(e, a, i)
        }, i => {
            i && e.failed(`Fail to delete imported files for sub assets of ${r}: ${i.stack}`), t()
        })
    }], e => {
        o && o(e)
    })
}

function d(t, i) {
    let a = t._metaToAssetPath(i);
    return !e.existsSync(a) && (t.info(`remove unused meta: ${t._url(i)}`), e.unlinkSync(i), !0)
}

function f(i, a, r) {
    if (!i.metaBackupPath) return null;
    if ("boolean" != typeof r && (r = !1), r || !e.existsSync(i._metaToAssetPath(a))) {
        let r = i.getRelativePath(a),
            n = t.normalize(t.join(i.metaBackupPath, r)),
            o = t.dirname(n);
        return e.ensureDirSync(o), e.copySync(a, n), e.unlinkSync(a), i.warn(`Backup unused meta file: ${i._url(a)}`), r
    }
    return null
}

function h(r, n) {
    let o = /\S{8}-\S{4}-\S{4}-\S{4}-\S{12}/;
    a(t.join(r._importPath, "**/*"), (a, s) => {
        i.each(s, (i, a) => {
            if (i = t.normalize(i), e.isDirSync(i)) return a(), void 0;
            let n = o.exec(i);
            if (n.length) {
                if (n = n[0], void 0 !== r._uuid2path[n]) return a(), void 0;
                r.log(`remove unused import file ${n}`), l(r, n, e => {
                    e && r.failed(`Failed to remove import file ${n}, message: ${e.stack}`), a()
                })
            }
        }, e => {
            n && n(e)
        })
    })
}

function m(t, a) {
    let r = Object.keys(t._uuid2mtime);
    i.each(r, (i, a) => {
        let r = t.uuidToFspath(i);
        e.existsSync(r) || (delete t._uuid2mtime[i], t.log(`remove unused mtime info: ${i}`)), a()
    }, e => {
        a && a(e)
    })
}

function p(i, r, n, o) {
    "function" == typeof n && (o = n, n = null), "boolean" != typeof (n = n || {})["remove-unused-meta"] && (n["remove-unused-meta"] = !0), "boolean" != typeof n["filter-meta"] && (n["filter-meta"] = !0);
    let s = r;
    e.isDirSync(r) && (s = [s, t.join(r, "**/*")]);
    let u = [],
        l = [];
    a(s, (e, a) => {
        if (e) return o && o(e), void 0;
        a.forEach(e => {
            if (e = t.normalize(e), i._isMountPath(e)) return;
            if (".meta" !== t.extname(e) || !n["filter-meta"]) return u.push(e), void 0;
            if (n["remove-unused-meta"]) d(i, e);
            else {
                let t = f(i, e);
                t && l.push(t)
            }
        }), o && (i._handleMetaBackupResults(l), o(null, u))
    })
}

function c(t, i, a) {
    if (t._isMountPath(i)) return a && a(null, !1), void 0;
    let r = t.fspathToUuid(i),
        n = i + ".meta";
    if (!e.existsSync(n)) return a && a(null, !0), void 0;
    if (!r) return a && a(null, !0), void 0;
    let o = s.load(t, n);
    if (o.ver !== o.constructor.version()) return a(null, !0), void 0;
    let u = o.getSubMetas();
    for (let e in u) {
        let t = u[e];
        if (t.ver !== t.constructor.version()) return a(null, !0), void 0
    }
    let l = o.dests();
    for (let t = 0; t < l.length; ++t)
        if (!e.existsSync(l[t])) return a && a(null, !0), void 0;
    let d = t._uuid2mtime[r];
    if (d) {
        let r = e.statSync(i);
        if (d.asset !== r.mtime.getTime()) return a && a(null, !0), void 0;
        let n = e.statSync(i + ".meta");
        if (d.meta !== n.mtime.getTime()) return a && a(null, !0), void 0;
        let o = t.getRelativePath(i);
        return d.relativePath !== o ? (a && a(null, !0), void 0) : (a && a(null, !1), void 0)
    }
    a && a(null, !0)
}

function y(i, r, n, o, u) {
    let l = r;
    e.isDirSync(r) && (l = t.join(r, "**/*"), i._isMountPath(r) || (l = [r, l]));
    let f = [];
    a(l, (a, r) => {
        if (a) return u && u(a), void 0;
        r.forEach(a => {
            let r;
            if (a = t.normalize(a), ".meta" === t.extname(a)) return o && d(i, a), void 0;
            let u, l = a + ".meta";
            if (l = a + ".meta", e.existsSync(l) && (r = s.load(i, l))) {
                f.push({
                    assetpath: a,
                    meta: r
                });
                let e = r.getSubMetas();
                if (e)
                    for (let i in e) {
                        let r = e[i],
                            n = t.join(a, i);
                        f.push({
                            assetpath: n,
                            meta: r
                        })
                    }
            } else n && (u = n[a]), r = s.create(i, l, u), s.save(i, l, r), f.push({
                assetpath: a,
                meta: r
            })
        }), u && u(null, f)
    })
}

function v(e, a, r) {
    let n = !1,
        o = a + ".meta",
        u = s.load(e, o);
    if (!u && (u = s.create(e, o), n = !0, !u)) return r && r(new Error(`Can not create or load meta from ${a}`)), void 0;
    if (e.isSubAssetByPath(a)) return r && r(null, u), void 0;
    let l = u.constructor.version();
    u.ver !== l && (u.ver = l, n = !0);
    let d = u.copySubMetas(),
        f = {};
    i.series([t => {
        if (u.import) try {
            e.log(`import asset ${a}...`), u.import(a, e => {
                f = u.getSubMetas() || {}, n = !0, t(e)
            })
        } catch (e) {
            t(e)
        } else t()
    }, t => {
        let i = Object.keys(d);
        for (let t = 0; t < i.length; ++t) {
            let a = i[t],
                r = d[a],
                n = e.uuidToFspath(r.uuid);
            e._dbDelete(n)
        }
        i = Object.keys(f);
        for (let e = 0; e < i.length; ++e) {
            let t = i[e],
                a = f[t];
            d[t] && (a.uuid = d[t].uuid)
        }
        t()
    }, r => {
        let o = Object.keys(f);
        i.eachLimit(o, 2, (i, r) => {
            let o = t.join(a, i),
                s = f[i],
                u = s.constructor.version();
            s.ver !== u && (s.ver = u), s.import ? s.import(o, function (t) {
                if (t) return r(t), void 0;
                n = !0, e._dbAdd(o, s.uuid), r()
            }) : (e._dbAdd(o, s.uuid), r())
        }, e => {
            r(e)
        })
    }], t => {
        if (t) return r && r(t), void 0;
        n && s.save(e, o, u), r && r(null, u)
    })
}

function g(e, a, r) {
    a.path || r(new Error("Incomplete asset info: no path included"));
    let n = !1,
        o = a.path,
        u = o + ".meta",
        l = a.meta || s.get(e, e.fspathToUuid(o)),
        d = a.isSubAsset || e.isSubAssetByPath(o);
    if (!l || d) return r && r(null, l), void 0;
    i.series([t => {
        if (l.postImport) try {
            e.log("post-import asset " + o + "..."), l.postImport(o, e => {
                n = !0, t(e)
            })
        } catch (e) {
            t(e)
        } else t()
    }, e => {
        let a = l.getSubMetas(),
            r = Object.keys(a);
        i.eachLimit(r, 2, i.ensureAsync((e, i) => {
            let r = t.join(o, e),
                s = a[e];
            s.postImport ? s.postImport(r, function () {
                n = !0, i()
            }) : i()
        }), t => {
            e(t)
        })
    }], t => {
        if (t) return r && r(t), void 0;
        n && s.save(e, u, l), r && r(null, l)
    })
}

function b(e, i, a, r) {
    let n = t.dirname(i),
        o = e.fspathToUuid(n),
        s = e.mountInfoByPath(i);
    r.push({
        uuid: a.uuid,
        parentUuid: o,
        url: e._url(i),
        path: i,
        type: a.assetType(),
        hidden: !!s.hidden,
        readonly: !!s.readonly
    });
    let u = a.getSubMetas();
    if (u)
        for (let n in u) {
            let o = u[n],
                l = t.join(i, n);
            r.push({
                uuid: o.uuid,
                parentUuid: a.uuid,
                url: e._url(l),
                path: l,
                type: o.assetType(),
                isSubAsset: !0,
                hidden: !!s.hidden,
                readonly: !!s.readonly
            })
        }
}

function $(e, t, a, r) {
    Array.isArray(t) || (t = [t]);
    let n = [];
    for (var o = 0, s = t.length; o < s; o++) e.isSubAssetByPath(t[o]) || n.push(t[o]);
    i.waterfall([t => {
        let a = [];
        i.eachSeries(n, (t, i) => {
            e.log(`scan ${t}...`), p(e, t, {
                "remove-unused-meta": !1
            }, (e, t) => {
                if (e) return i(), void 0;
                a = a.concat(t), i()
            })
        }, () => {
            t(null, a)
        })
    }, (t, r) => {
        if (a) return r(null, t), void 0;
        e.log("check if reimport...");
        let n = [];
        i.each(t, i.ensureAsync((t, i) => {
            c(e, t, (a, r) => {
                if (a) return e.failed(`Failed to check if reimport for ${t}, message: ${a.stack}`), i(), void 0;
                r && n.push(t), i()
            })
        }), e => {
            r(e, n)
        })
    }, (t, a) => {
        e.log("reimport assets...");
        let r = [];
        i.eachLimit(t, 2, i.ensureAsync((t, i) => {
            v(e, t, (a, n) => {
                if (a) return e.failed(`Failed to import asset ${t}, message: ${a.stack}`), r.push({
                    path: t,
                    url: e._url(t),
                    uuid: e.fspathToUuid(t),
                    error: a
                }), i(), void 0;
                b(e, t, n, r), i()
            })
        }), e => {
            a(e, r)
        })
    }, (t, a) => {
        e.log("post import assets..."), i.eachLimit(t, 2, i.ensureAsync((t, i) => {
            if (t.isSubAsset) return i(), void 0;
            g(e, t, (a, r) => {
                if (a) return e.failed(`Failed to post import asset ${t.path}, message: ${a.stack}`), i(), void 0;
                e.updateMtime(r.uuid), i()
            })
        }), e => {
            a(e, t)
        })
    }], (e, t) => {
        r && r(e, t)
    })
}

function _(e, i, a) {
    let r = i.getSubMetas() || {},
        n = e.uuidToFspath(i.uuid),
        o = [],
        s = [],
        u = [],
        l = Object.keys(a);
    for (let e = 0; e < l.length; ++e) {
        let i = l[e],
            s = a[i];
        r[i] || o.push({
            uuid: s.uuid,
            path: t.join(n, i)
        })
    }
    l = Object.keys(r);
    for (let o = 0; o < l.length; ++o) {
        let d = l[o],
            f = r[d],
            h = t.join(n, d);
        if (a[d]) u.push({
            uuid: f.uuid,
            parentUuid: i.uuid,
            path: h,
            url: e.uuidToUrl(f.uuid),
            type: f.assetType(),
            isSubAsset: !0
        });
        else {
            let t = e.mountInfoByUuid(f.uuid);
            s.push({
                uuid: f.uuid,
                parentUuid: i.uuid,
                path: h,
                url: e.uuidToUrl(f.uuid),
                type: f.assetType(),
                isSubAsset: !0,
                hidden: !!t.hidden,
                readonly: !!t.readonly
            })
        }
    }
    return {
        deleted: o,
        added: s,
        remained: u
    }
}
module.exports = u, u.mount = function (i, a, r, n, s) {
    if ("string" != typeof a) return s && s(new Error("expect 1st param to be a string")), void 0;
    if (!e.isDirSync(a)) return s && s(new Error(`Failed to mount ${a}, path not found or it is not a directory!`)), void 0;
    if ("string" != typeof r) return s && s(new Error("Expect 2nd param to be a string")), void 0;
    (function (e, i, a) {
        /[\\/.]/.test(a) && e.throw("normal", `Invalid character in ${a}, you can not contains '/', '\\' or '.'`), e._mounts[a] && e.throw("normal", `Failed to mount ${i} to ${a}, already exists!`);
        for (let r in e._mounts) {
            let n = e._mounts[r];
            t.contains(n.path, i) && e.throw("normal", `Failed to mount ${i} to ${a}, the path or its parent ${n.path} already mounted to ${r}`), t.contains(i, n.path) && e.throw("normal", `Failed to mount ${i} to ${a}, its child path ${n.path} already mounted to ${r}`)
        }
    })(i, a = t.resolve(a), r);
    let u = {
        path: a,
        mountPath: r,
        attached: !1
    };
    o.assign(u, n), i._mounts[r] = u, i._dbAdd(a, i._mountIDByMountPath(r)), s && s()
}, u.unmount = function (e, t, i) {
    return "string" != typeof t ? (i && i(new Error("expect 1st param to be a string")), void 0) : e._mounts[t] ? (e._dbDelete(e._mounts[t].path), delete e._mounts[t], i && i(), void 0) : (i && i(new Error("can not find the mount " + t)), void 0)
}, u.init = function (e, t) {
    let a = Object.keys(e._mounts),
        r = [];
    i.series([t => {
        i.eachSeries(a, (t, i) => {
            u.attachMountPath(e, t, (e, t) => {
                r = r.concat(t), i()
            })
        }, t)
    }, t => {
        h(e, i => {
            i && e.failed(`Failed to remove unused import files, message: ${i.stack}`), t()
        })
    }, t => {
        m(e, i => {
            i && e.failed(`Failed to remove unused mtime info, message: ${i.stack}`), e.updateMtime(), t()
        })
    }], e => {
        t && t(e, r)
    })
}, u.attachMountPath = function (e, t, a) {
    var r = [],
        n = e._mounts[t];
    return n ? n.attached ? (e.log(`db://${t} already attached!`), a(null, r), void 0) : (r.push({
        name: t,
        path: n.path,
        url: e._url(n.path),
        uuid: e._mountIDByMountPath(t),
        hidden: !!n.hidden,
        readonly: !!n.readonly,
        type: "mount"
    }), i.series([i => {
        let a = e._mounts[t].path;
        e.log(`init meta files at db://${t}`), y(e, a, null, !1, (t, a) => {
            a.forEach(t => {
                e._dbAdd(t.assetpath, t.meta.uuid)
            }), i()
        })
    }, i => {
        let a = e._mounts[t].path;
        e.log(`refresh at db://${t}`), $(e, a, !1, (a, n) => {
            if (a) return e.failed(`Failed to refresh db://${t}`), i(), void 0;
            e._handleErrorResults(n), r = r.concat(n), i()
        })
    }], i => {
        r.forEach(e => {
            e.command = "create"
        }), e._mounts[t].attached = !0, a && a(i, r)
    }), void 0) : (e.failed(`db://${t} is not a mount path.`), a(new Error(`${t} is not a valid mount path. Please mount it first.`)), void 0)
}, u.unattachMountPath = function (e, a, r) {
    var n = [],
        o = e._mounts[a];
    if (!o) return e.failed(`db://${a} is not a mount path.`), r(new Error(`${a} is not a valid mount path.`)), void 0;
    if (!o.attached) return e.log(`db://${a} has not been attached!`), r(null, n), void 0;
    var s = e._allPaths(),
        u = t.resolve(o.path);
    i.waterfall([t => {
        i.eachLimit(s, 3, (t, i) => {
            0 === t.indexOf(u) && (n.push({
                path: t,
                url: e._url(t),
                uuid: e.fspathToUuid(t),
                command: "delete"
            }), e._dbDelete(t)), i()
        }, t)
    }, t => {
        h(e, i => {
            i && e.failed(`Failed to remove unused import files, message: ${i.stack}`), t()
        })
    }, t => {
        m(e, i => {
            i && e.failed(`Failed to remove unused mtime info, message: ${i.stack}`), e.updateMtime(), t()
        })
    }], t => {
        e._mounts[a].attached = !1, r && r(t, n)
    })
}, u.refresh = function (a, r, n) {
    let o = [],
        s = {};
    for (let e in a._path2uuid) s[e] = a._path2uuid[e];
    Array.isArray(r) || (r = [r]), r = r.map((e, i) => (a.isSubAssetByPath(e) && (e = t.dirname(e)), e)), i.waterfall([e => {
        let t = [];
        i.eachSeries(r, (e, i) => {
            if (!a.fspathToUuid(e)) return i(), void 0;
            u.clearImports(a, e, s, (e, a) => {
                if (e) return i(), void 0;
                t = t.concat(a), i()
            })
        }, () => {
            e(null, t)
        })
    }, (t, i) => {
        t.forEach(t => {
            let i = t.path + ".meta";
            e.existsSync(t.path) || (t.command = "delete", o.push(t), e.existsSync(i) && e.unlinkSync(i))
        }), i()
    }, e => {
        i.eachSeries(r, (e, t) => {
            y(a, e, s, !1, (e, i) => {
                i.forEach(e => {
                    let t = a._path2uuid[e.assetpath],
                        i = a._uuid2path[e.meta.uuid];
                    t && t === e.meta.uuid && i && i === e.assetpath || a._dbAdd(e.assetpath, e.meta.uuid)
                }), t()
            })
        }, e)
    }, e => {
        $(a, r, !0, e)
    }], (e, t) => {
        if (e) return n && n(e), void 0;
        t.forEach(e => {
            let t = s[e.path],
                i = a.fspathToUuid(e.path);
            for (let e = 0; e < o.length; ++e)
                if (i === o[e].uuid) {
                    o.splice(e, 1);
                    break
                } if (t) t !== i ? (e.command = "uuid-change", e.oldUuid = t) : e.command = "change";
            else {
                e.command = "create";
                let t = a.mountInfoByUuid(i);
                e.hidden = !!t.hidden, e.readonly = !!t.readonly
            }
        }), o = o.concat(t), n && n(null, o)
    })
}, u.deepQuery = function (e, i) {
    let a = [],
        r = Object.keys(e._path2uuid);
    r.sort((e, t) => e.length - t.length);
    for (let i = 0; i < r.length; ++i) {
        let n, o, u, l = r[i],
            d = e._path2uuid[l],
            f = e._path2uuid[t.dirname(l)],
            h = e.isSubAssetByPath(l);
        o = t.extname(l);
        let m = e.mountInfoByPath(l);
        if (e.isMountByPath(l)) n = t.basenameNoExt(m.mountPath), u = "mount";
        else {
            "folder" === (u = s.get(e, e.fspathToUuid(l)).assetType()) ? (n = t.basename(l), o = "") : n = t.basenameNoExt(l)
        }
        let p = {
            uuid: d,
            parentUuid: f,
            name: n,
            extname: o,
            type: u,
            isSubAsset: h,
            hidden: !!m.hidden,
            readonly: !!m.readonly
        };
        a.push(p)
    }
    i && i(null, a)
}, u.queryAssets = function (e, t, i, a) {
    let n = [],
        o = Object.keys(e._path2uuid),
        u = o;
    t && (u = r.match(o, t)), "string" == typeof (i = i || []) && (i = [i]);
    for (let t = 0; t < u.length; ++t) {
        let a = u[t],
            r = e._path2uuid[a],
            o = e.isSubAssetByPath(a),
            l = s.get(e, r);
        if (!l) continue;
        let d = l.assetType();
        if (i.length && -1 === i.indexOf(d)) continue;
        let f = e.mountInfoByPath(a),
            h = {
                url: e._url(a),
                path: a,
                uuid: r,
                type: d,
                readonly: !!f.readonly,
                hidden: !!f.hidden,
                isSubAsset: o,
                destPath: e._getDestPathByMeta(l)
            };
        n.push(h)
    }
    n.sort((e, t) => e.path.localeCompare(t.path)), a && a(null, n)
}, u.queryMetas = function (e, t, i, a) {
    let n = [],
        o = Object.keys(e._path2uuid);
    t && (o = r.match(o, t));
    for (let t = 0; t < o.length; ++t) {
        let a = o[t],
            r = s.get(e, e.fspathToUuid(a));
        if (!r) {
            e._isMountPath(a) || console.warn(`Meta ${a} is not exists`);
            continue
        }
        let u = r.assetType();
        i && u !== i || n.push(r)
    }
    a && a(null, n)
}, u.import = function (a, r, n, o) {
    if (a.mountInfoByPath(n).readonly) {
        let e = a.fspathToUrl(n);
        return o && o(new Error(`${e} is readonly, CAN NOT import assets into it in Editor.`)), void 0
    }
    var s = null,
        l = [];
    i.waterfall([i => {
        (function (i, a, r, n) {
            if (!e.isDirSync(r)) return n && n(new Error("Invalid dest path, make sure it exists and it is a directory")), void 0;

            function o(a) {
                if (i._isAssetPath(a)) return i.failed(`Can not import file ${a}, already in the database`), -1;
                let n = t.join(r, t.basename(a));
                return e.existsSync(n) ? 0 : 1
            }
            a.map(e => t.basename(e)), a = i.arrayCmpFilter(a, (e, i) => t.contains(e, i) ? 1 : t.contains(i, e) ? -1 : 0);
            for (var s = [], u = [], l = 0; l < a.length; l++) {
                let e = a[l];
                var d = o(e);
                d > 0 ? s.push(e) : 0 === d && u.push(e)
            }
            n && n(null, {
                importFiles: s,
                mergeFiles: u
            })
        })(a, r, n, (e, t) => {
            s = t, i(e)
        })
    }, r => {
        let o = {
                importFiles: [],
                mergeFiles: []
            },
            u = s.importFiles.concat(s.mergeFiles);
        i.each(u, (i, r) => {
            a.log(`copy file ${t.basename(i)}...`);
            let u = t.join(n, t.basename(i)),
                l = s.mergeFiles.indexOf(i) >= 0;
            e.copy(i, u, e => {
                if (e) return a.failed(`Failed to copy file ${i}. ${e}`), r(), void 0;
                l ? o.mergeFiles.indexOf(u) < 0 && o.mergeFiles.push(u) : o.importFiles.indexOf(u) < 0 && o.importFiles.push(u), r()
            })
        }, e => {
            r(e, o)
        })
    }, (e, t) => {
        if (0 === e.mergeFiles.length) return t(null, e.importFiles), void 0;
        u.refresh(a, e.mergeFiles, (i, r) => {
            if (i) return a.failed(`Failed to refresh assets ${e.mergeFiles}, message: ${i.stack}`), t(null, e.importFiles), void 0;
            l = l.concat(r), t(null, e.importFiles)
        })
    }, (e, t) => {
        let r = [];
        a.log("init metas..."), i.each(e, (e, t) => {
            y(a, e, null, !0, (e, i) => {
                i.forEach(e => {
                    a._dbAdd(e.assetpath, e.meta.uuid), a.isSubAssetByPath(e.assetpath) || r.push(e.assetpath)
                }), t()
            })
        }, e => {
            t(e, r)
        })
    }, (e, t) => {
        a.log("import assets...");
        let r = [];
        i.eachLimit(e, 2, (e, t) => {
            v(a, e, (i, n) => {
                if (i) return a.failed(`Failed to import asset ${e}, message: ${i.stack}`), t(), void 0;
                b(a, e, n, r), t()
            })
        }, e => {
            t(e, r)
        })
    }, (e, t) => {
        a.log("post import assets..."), i.eachLimit(e, 2, (e, t) => {
            if (e.isSubAsset) return t(), void 0;
            g(a, e, (i, r) => {
                if (i) return a.failed(`Failed to post import asset ${e.path}, message: ${i.stack}`), t(), void 0;
                t()
            })
        }, i => {
            t(i, e)
        })
    }, (e, t) => {
        e.forEach(e => {
            a.updateMtime(e.uuid)
        }), e.sort((e, t) => e.path.localeCompare(t.path)), t(null, e)
    }], (e, t) => {
        l = l.concat(t), o && o(e, l)
    })
}, u.postImport = function (e, t, a) {
    i.waterfall([i => {
        g(e, {
            path: t
        }, (a, r) => {
            a ? (e.failed(`Failed to post import asset ${t}, message: ${a.stack}`), i(a)) : i(null, r)
        })
    }, (t, i) => {
        t && e.updateMtime(t.uuid), i(null, t)
    }], (e, t) => {
        a && a(e, t)
    })
}, u.assetMove = function (a, r, n, o) {
    let u, d, f, h, m = e.isDirSync(r),
        c = t.basename(r) !== t.basename(n),
        y = [];
    i.series([e => {
        (function (e, i, a, r) {
            p(e, i, null, (e, n) => {
                let o = n.map(e => {
                    let r = t.relative(i, e);
                    return t.join(a, r)
                });
                r && r(null, n, o)
            })
        })(a, r, n, (t, i, r) => {
            if (t) return e(t), void 0;
            d = r, f = (u = i).map(e => a.fspathToUuid(e)), h = u.map(e => {
                return s.get(a, a.fspathToUuid(e)).copySubMetas()
            }), e()
        })
    }, e => {
        if (m || !c) return e(), void 0;
        (function (e, t, a) {
            i.eachSeries(t, (t, i) => {
                l(e, t, i)
            }, e => {
                a && a(e)
            })
        })(a, f, e)
    }, t => {
        (function (t, a, r, n) {
            i.series([t => {
                e.rename(a, r, t)
            }, i => {
                let n = a + ".meta",
                    o = r + ".meta";
                if (!e.existsSync(n)) return i(), void 0;
                e.rename(n, o, n => {
                    n && e.rename(r, a, e => {
                        t.error(e)
                    }), i(n)
                })
            }], n)
        })(a, r, n, t)
    }, e => {
        for (let e = 0; e < u.length; e++) {
            if (m || !c) {
                let t = a.subAssetInfosByPath(u[e]),
                    i = u[e],
                    r = d[e];
                for (let e = 0; e < t.length; ++e) {
                    let n = t[e].path,
                        o = n.replace(i, r);
                    a._dbMove(n, o)
                }
            }
            a._dbMove(u[e], d[e])
        }
        e()
    }, e => {
        if (m || !c) return e(), void 0;
        i.eachLimit(d, 2, (e, t) => {
            v(a, n, (e, i) => {
                e && a.failed(`Failed to import asset ${n}, message: ${e.stack}`), y.push(i), t()
            })
        }, () => {
            e()
        })
    }, e => {
        if (m || !c) return e(), void 0;
        i.eachLimit(d, 2, (e, t) => {
            g(a, {
                path: n
            }, (e, i) => {
                e && a.failed(`Failed to post import asset ${n}, message: ${e.stack}`), t()
            })
        }, () => {
            e()
        })
    }, e => {
        f.forEach(e => {
            a.updateMtime(e)
        }), e()
    }], e => {
        if (!o) return;
        if (e) return o(e), void 0;
        let i = [];
        for (let e = 0; e < d.length; ++e) {
            let r = t.dirname(d[e]),
                n = null;
            y[e] && (n = _(a, y[e], h[e]));
            let o = a.mountInfoByUuid(f[e]);
            i.push({
                uuid: f[e],
                url: a.uuidToUrl(f[e]),
                parentUuid: a.fspathToUuid(r),
                srcPath: u[e],
                destPath: d[e],
                subMetas: n,
                hidden: !!o.hidden,
                readonly: !!o.readonly
            })
        }
        o(null, i)
    })
}, u.delete = function (a, r, o) {
    Array.isArray(r) || (r = [r]);
    let s = a.arrayCmpFilter(r, (e, i) => t.contains(e, i) ? 1 : t.contains(i, e) ? -1 : 0).map(e => a._fspath(e)),
        l = [];
    i.each(s, (t, r) => {
        (function (t, a, r) {
            if (!e.existsSync(a)) return r && r(new Error(`Asset ${a} is not exists`)), void 0;
            let o;
            if (t.mountInfoByPath(a).readonly) {
                if (r) {
                    let e = t.fspathToUrl(a);
                    r(new Error(`${e} is readonly, CAN NOT delete it in Editor.`))
                }
            } else i.series([e => {
                n([a], {
                    force: !0
                }, e)
            }, e => {
                n([a + ".meta"], {
                    force: !0
                }, e)
            }, e => {
                u.clearImports(t, a, null, (t, i) => {
                    o = i, e()
                })
            }], e => {
                if (e) return r && r(e), void 0;
                let t = [];
                for (let e = 0; e < o.length; ++e) {
                    let i = o[e];
                    t.push({
                        path: i.path,
                        uuid: i.uuid
                    })
                }
                r && r(null, t)
            })
        })(a, t, (e, i) => {
            if (e) {
                let i = a.fspathToUuid(t);
                return a.error(`Failed to delete asset ${i}, messages: ${e.stack}`), r(e), void 0
            }
            l = l.concat(i), r()
        })
    }, e => {
        o(e, l)
    })
}, u.create = function (a, r, n, o) {
    if (!r) return o && o(new Error(`Invalid path: ${r}`)), void 0;
    if (a.mountInfoByPath(r).readonly) {
        if (o) {
            let e = a.fspathToUrl(t.dirname(r));
            o(new Error(`${e} is readonly, CAN NOT create it in Editor.`))
        }
        return
    }
    let s = r,
        u = 0;
    for (; e.existsSync(s);) u += 1, s = t.join(t.dirname(r), t.basenameNoExt(r) + " - " + a.padLeft(u, 3, "0") + t.extname(r));
    r = s;
    let l = t.dirname(r);
    if (!e.existsSync(l)) return o && o(new Error(`Parent path ${l} is not exists`)), void 0;
    let d = a._ensureDirSync(t.dirname(r));
    i.waterfall([i => {
        a.log(`write ${r}...`);
        let o = t.extname(r),
            s = e.existsSync(r);
        if (!o && !1 === s) return e.mkdir(r, i), void 0;
        e.writeFile(r, n, i)
    }, e => {
        v(a, r, e)
    }, (e, t) => {
        g(a, {
            path: r,
            meta: e
        }, t)
    }, (e, t) => {
        a._dbAdd(r, e.uuid), a.updateMtime(e.uuid), t(null, e)
    }], (e, i) => {
        if (e) return o && o(e), void 0;
        let n = [];
        d.forEach(e => {
            let i = a.uuidToFspath(e.uuid),
                r = t.dirname(i),
                o = a.fspathToUuid(r),
                s = a.mountInfoByPath(i);
            n.push({
                uuid: e.uuid,
                parentUuid: o,
                url: a._url(i),
                path: i,
                type: e.assetType(),
                hidden: !!s.hidden,
                readonly: !!s.readonly
            })
        }), b(a, r, i, n), o && o(e, n)
    })
}, u.saveExists = function (a, r, n, o) {
    if (!a.existsByPath(r)) return o && o(new Error(r + " is not exists")), void 0;
    if (a.mountInfoByPath(r).readonly) {
        if (o) {
            let e = a.fspathToUrl(r);
            o(new Error(`${e} is readonly, CAN NOT save the changes in Editor.`))
        }
        return
    }
    let s = a.loadMetaByPath(r).copySubMetas(),
        u = a.fspathToUuid(r);
    i.waterfall([t => {
        e.writeFile(r, n, t)
    }, i => {
        (function (i, a) {
            if (!i.assetBackupPath || !e.existsSync(a)) return;
            let r = i.getAssetBackupPath(a);
            if (!r) return;
            let n = t.dirname(r);
            e.ensureDirSync(n), e.copySync(a, r)
        })(a, r), i()
    }, e => {
        l(a, u, t => {
            t && a.failed(`Failed to delete imported assets of ${u} during save, message: ${t.stack}`), e()
        })
    }, e => {
        v(a, r, e)
    }, (e, t) => {
        g(a, {
            path: r,
            meta: e
        }, t)
    }, (e, t) => {
        a.updateMtime(u), t(null, e)
    }], (e, t) => {
        if (e) {
            if (o) {
                let t = {
                    path: r,
                    url: a._url(r),
                    uuid: u,
                    error: e
                };
                o(e, t)
            }
        } else if (o) {
            let i = _(a, t, s);
            o(e, {
                meta: t,
                subMetas: i
            })
        }
    })
}, u.saveMeta = function (e, a, r, n) {
    let o, u = e.uuidToFspath(a);
    if (e.mountInfoByPath(u).readonly) {
        if (n) {
            let t = e.fspathToUrl(u);
            n(new Error(`${t} is readonly, CAN NOT save the changes in Editor.`))
        }
        return
    }
    try {
        o = JSON.parse(r)
    } catch (e) {
        return n && n(new Error(`Failed to pase json string, message : ${e.message}`)), void 0
    }
    if (a !== o.uuid) return n && n(new Error("Uuid is not equal to json uuid")), void 0;
    let d = u + ".meta",
        f = e.loadMetaByPath(u);
    if (!f) return n && n(new Error(`Can't load meta for : ${a}`)), void 0;
    let h = f.copySubMetas();
    if (f.deserialize(o), e.isSubAssetByPath(u)) {
        let i = t.basename(u);
        d = (u = t.dirname(u)) + ".meta";
        let r = e.loadMetaByPath(u);
        a = r.uuid, h = r.copySubMetas(), r.getSubMetas()[i] = f, f = r
    }
    s.save(e, d, f), i.waterfall([t => {
        l(e, a, i => {
            i && e.failed(`Failed to delete imported assets of ${a} during saveMeta, message: ${i.stack}`), t()
        })
    }, t => {
        v(e, u, t)
    }, (t, i) => {
        g(e, {
            path: u,
            meta: t
        }, i)
    }, (t, i) => {
        let r = _(e, t, h);
        for (let t = 0; t < r.added.length; ++t) {
            let i = r.added[t];
            e.existsByUuid(i.uuid) || (e._dbAdd(i.path, i.uuid), e.updateMtime(i.uuid))
        }
        for (let t = 0; t < r.deleted.length; ++t) {
            let i = r.deleted[t];
            e.existsByUuid(i.uuid) && e._dbDelete(i.path)
        }
        e.updateMtime(a), i(null, {
            meta: t,
            subMetas: r
        })
    }], (e, t) => {
        if (e) return n && n(e), void 0;
        n && n(null, t)
    })
}, u.clearImports = function (a, r, n, o) {
    if (!a.fspathToUuid(r)) return o && o(new Error(`path-2-uuid does not contian: ${r}`)), void 0;
    a.log(`clear imports ${r}`);
    let u = [];
    for (let e in a._path2uuid) t.contains(r, e) && (a._isMountPath(e) || u.push(e));
    let d = [];
    i.eachSeries(u, (t, r) => {
        let o = a.assetInfoByPath(t),
            u = o.uuid;
        d.push(o), i.series([i => {
            let r, o = t + ".meta",
                l = e.existsSync(o);
            if (l) r = s.load(a, o);
            else {
                r = new(s.findCtor(a, t))(a)
            }
            if (r && r.delete) return l || a.warn(`Try to delete imported files from an un-exists path : ${o}.\n              This is not 100% work, please check them manually.`), r.uuid = n && n[t] || u, a.log(`do meta.delete ${o}...`), r.delete(t, i), void 0;
            i()
        }, e => {
            l(a, u, t => {
                t && a.failed(`Failed to delete imported assets of ${u} during clearImports, message: ${t.stack}`), e()
            })
        }, e => {
            a._dbDelete(t), a.updateMtime(u), e()
        }], r)
    }, e => {
        o && o(e, d)
    })
}, u.copy = function (r, o, s, u, l) {
    i.series([t => {
        e.copy(o, s, t)
    }, t => {
        if (!u) return t(), void 0;
        let i = o + ".meta",
            a = s + ".meta";
        e.existsSync(i) && e.copy(i, a, t)
    }, r => {
        if (!e.isDirSync(s) || u) return r(), void 0;
        let o = [t.join(s, "**/*.meta")];
        a(o, (e, a) => {
            a = a.map(e => t.resolve(e)), i.each(a, (e, t) => {
                n(e, {
                    force: !0
                }, t)
            }, e => {
                r(e)
            })
        })
    }], e => {
        l && l(e)
    })
}, u.move = function (e, t, a, r) {
    if (e.mountInfoByPath(t).readonly) {
        let i = e.fspathToUrl(t);
        return r && r(new Error(`${i} is readonly, CAN NOT move it in Editor.`)), void 0
    }
    if (e.mountInfoByPath(a).readonly) {
        let t = e.fspathToUrl(a);
        return r && r(new Error(`${t} is readonly, CAN NOT move asset into it in Editor.`)), void 0
    }
    i.waterfall([i => {
        u._checkMoveInput(e, t, a, i)
    }, i => {
        u.assetMove(e, t, a, i)
    }], (e, t) => {
        if (e) return r && r(e), void 0;
        r && r(null, t)
    })
}, u.exchangeUuid = function (e, t, a, r) {
    let n = e.loadMetaByPath(t);
    if (!n) return r && r(new Error(`Can't load meta for : ${t}`)), void 0;
    let o = e.loadMetaByPath(a);
    if (!o) return r && r(new Error(`Can't load meta for : ${a}`)), void 0;
    let s = n.uuid;
    n.uuid = o.uuid, o.uuid = s, e._uuid2meta[n.uuid] = n, e._path2uuid[t] = n.uuid, e._uuid2path[n.uuid] = t, e._uuid2meta[o.uuid] = o, e._path2uuid[a] = o.uuid, e._uuid2path[o.uuid] = a, i.series([t => {
        u.saveMeta(e, n.uuid, JSON.stringify(n.serialize(), null, 2), t)
    }, t => {
        u.saveMeta(e, o.uuid, JSON.stringify(o.serialize(), null, 2), t)
    }], r)
}, u._backupUnusedMeta = f, u._scan = p, u._checkIfReimport = c, u._initMetas = y, u._refresh = $, u._importAsset = v, u._checkMoveInput = function (i, a, r, n) {
    let o = t.dirname(r),
        s = e.existsSync(a),
        u = e.existsSync(r),
        l = e.isDirSync(a),
        d = e.isDirSync(r),
        f = t.basename(a);
    return s ? e.existsSync(o) ? u && a.toLowerCase() !== r.toLowerCase() ? (n && n(new Error(`Dest asset ${r} already exists`)), void 0) : d && l && e.existsSync(t.join(r, f)) ? (n && n(new Error(`Dest normal asset ${r} already exists`)), void 0) : (n && n(), void 0) : (n && n(new Error(`Dest parent path ${o} is not exists`)), void 0) : (n && n(new Error(`Src asset ${a} is not exists`)), void 0)
};