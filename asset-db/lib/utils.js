"use strict";
const t = require("fire-path"),
    i = require("fire-fs"),
    e = require("chalk"),
    s = require("util"),
    r = e.green,
    n = e.yellow,
    l = e.red,
    a = e.cyan;
let o = {};
module.exports = o;
let u, c, h, f, p, m, y = global.Editor;
u = console.log, c = function () {
    let t = s.format.apply(s, arguments);
    console.log(r(t))
}, f = function () {
    let t = s.format.apply(s, arguments);
    console.info(a(t))
}, h = y && y.failed ? y.failed : function () {
    let t = s.format.apply(s, arguments);
    console.log(l(t))
}, p = y && y.warn ? y.warn : function () {
    let t = s.format.apply(s, arguments);
    t = t + "\n" + new Error("dummy").stack.split("\n").splice(2).join("\n"), console.warn(n(t))
}, m = y && y.error ? y.error : function () {
    let t = s.format.apply(s, arguments);
    t = t + "\n" + new Error("dummy").stack.split("\n").splice(2).join("\n"), console.error(l(t))
}, y && y.throw ? o.throw = y.throw : o.throw = function (t) {
    let i = [].slice.call(arguments, 1),
        e = s.format.apply(s, i);
    if ("type" === t) throw new TypeError(e);
    throw new Error(e)
}, o.log = function () {
    if (this.dev && !this.silent) {
        if (this._curTask) {
            let t = [].slice.call(arguments, 1);
            return t.unshift("[db-task][%s] " + arguments[0], this._curTask.name), u.apply(this, t), void 0
        }
        u.apply(this, arguments)
    }
}, o.info = function () {
    if (this.dev && !this.silent) {
        if (this._curTask) {
            let t = [].slice.call(arguments, 1);
            return t.unshift("[db-task][%s] " + arguments[0], this._curTask.name), f.apply(this, t), void 0
        }
        f.apply(this, arguments)
    }
}, o.success = function () {
    if (this.dev && !this.silent) {
        if (this._curTask) {
            let t = [].slice.call(arguments, 1);
            return t.unshift("[db-task][%s] " + arguments[0], this._curTask.name), c.apply(this, t), void 0
        }
        c.apply(this, arguments)
    }
}, o.failed = function () {
    if (!this.silent) {
        if (this._curTask) {
            let t = [].slice.call(arguments, 1);
            return t.unshift("[db-task][%s] " + arguments[0], this._curTask.name), h.apply(this, t), void 0
        }
        h.apply(this, arguments)
    }
}, o.warn = function () {
    if (!this.silent) {
        if (this._curTask) {
            let t = [].slice.call(arguments, 1);
            return t.unshift("[db-task][%s] " + arguments[0], this._curTask.name), p.apply(this, t), void 0
        }
        p.apply(this, arguments)
    }
}, o.error = function () {
    if (!this.silent) {
        if (this._curTask) {
            let t = [].slice.call(arguments, 1);
            return t.unshift("[db-task][%s] " + arguments[0], this._curTask.name), m.apply(this, t), void 0
        }
        m.apply(this, arguments)
    }
}, o.mkdirForAsset = function (e) {
    e && "" !== e || this.throw("normal", "Invalid uuid");
    let s = e.substring(0, 2),
        r = t.join(this._importPath, s);
    return i.existsSync(r) || i.mkdirSync(r), r
}, o.copyAssetToLibrary = function (e, s) {
    let r = this._uuidToImportPathNoExt(e) + t.extname(s);
    return this.mkdirForAsset(e), i.copySync(s, r), r
}, o.saveAssetToLibrary = function (e, s, r) {
    let n;
    "string" == typeof s || s instanceof Buffer ? n = s : (s.serialize && (n = s.serialize()), n || (n = JSON.stringify(s, null, 2))), r = r || ".json";
    let l = this.mkdirForAsset(e);
    return l = t.join(l, e + r), i.writeFileSync(l, n), l
};
let d = null;
o.updateMtime = function (t) {
    if (!this.isSubAssetByUuid(t)) {
        if (t) {
            let e = this._uuid2path[t];
            if (e && i.existsSync(e)) {
                let s = i.statSync(e).mtime.getTime(),
                    r = i.statSync(e + ".meta").mtime.getTime(),
                    n = this.getRelativePath(e);
                this._uuid2mtime[t] = {
                    asset: s,
                    meta: r,
                    relativePath: n
                }
            } else delete this._uuid2mtime[t]
        }
        d && (clearTimeout(d), d = null), d = setTimeout(() => {
            let t = JSON.stringify(this._uuid2mtime, null, 2);
            i.existsSync(this.library) && i.writeFileSync(this._uuid2mtimePath, t, "utf8")
        }, 50)
    }
}, o.arrayCmpFilter = function (t, i) {
    let e = [];
    for (let s = 0; s < t.length; ++s) {
        let r = t[s],
            n = !0;
        for (let t = 0; t < e.length; ++t) {
            let s = e[t];
            if (r === s) {
                n = !1;
                break
            }
            let l = i(s, r);
            if (l > 0) {
                n = !1;
                break
            }
            l < 0 && (e.splice(t, 1), --t)
        }
        n && e.push(r)
    }
    return e
}, o.padLeft = function (t, i, e) {
    return (i -= (t = t.toString()).length) > 0 ? new Array(i + 1).join(e) + t : t
};