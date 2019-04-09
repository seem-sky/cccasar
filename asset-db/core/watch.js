"use strict";
const t = require("async"),
    e = require("fire-path"),
    a = require("fire-fs"),
    s = require("fsnap"),
    h = require("../lib/tasks.js");

function n(s, n, c) {
    let r = [],
        o = [];

    function d(t, e) {
        let n = t + ".meta";
        if (a.existsSync(n))
            if (s.metaBackupPath) {
                let t = h._backupUnusedMeta(s, n, !0);
                t && o.push(t)
            } else a.unlinkSync(n), s.warn(`Delete unused meta file: ${s._url(n)}`);
        h.clearImports(s, t, null, (a, h) => {
            if (a) return s.error(`Failed to delete asset ${t}`), e(), void 0;
            s._dispatchEvent("asset-db:assets-deleted", h), e()
        })
    }
    let p = [],
        l = [];
    for (let t = 0; t < n.length; ++t) {
        let h = n[t],
            c = h.path;
        if (".meta" !== e.extname(c)) "delete" !== h.command ? "new" !== h.command && "change" !== h.command ? Editor.warn(`Unknown changes ${h.command}, ${c}`) : i(l, c) : p.push(c);
        else {
            let t = h.path,
                n = e.join(e.dirname(t), e.basenameNoExt(t)),
                c = a.existsSync(n);
            "delete" === h.command && c || "change" === h.command ? i(l, n) : "new" !== h.command || c || (a.unlinkSync(t), s.warn(`Delete unused meta file: ${s._url(t)}`))
        }
    }
    t.series([e => {
        t.eachSeries(p, d, e)
    }, t => {
        h.refresh(s, l, (e, a) => {
            if (e) return t(), void 0;
            s._handleRefreshResults(a), t()
        })
    }], t => {
        s._handleMetaBackupResults(o), c && c(t, r)
    })
}

function c(t) {
    let e = [];
    return t.deletes.forEach(t => {
        e.push({
            command: "delete",
            path: t
        })
    }), t.changes.forEach(t => {
        e.push({
            command: "change",
            path: t
        })
    }), t.creates.forEach(t => {
        e.push({
            command: "new",
            path: t
        })
    }), e
}

function i(t, e) {
    t.indexOf(e) < 0 && t.push(e)
}

function r(t, e) {
    if (t._snapshot) return e && e(new Error("Failed to watch asset-db, already watched.")), void 0;
    let a = t._mountPaths();
    a = a.map(t => `${t}/**/*`), t._snapshot = s.create(a), e && e()
}

function o(t, e) {
    if (!t._snapshot) return e && e(new Error("Failed to stop watching asset-db, Already stopped.")), void 0;
    let a = t._mountPaths();
    a = a.map(t => `${t}/**/*`);
    let h = s.create(a),
        n = s.diff(t._snapshot, h);
    t._snapshot = null;
    let i = c(n = s.simplify(n));
    t.syncChanges(i), e && e()
}
module.exports = {
    watchON() {
        this._expectWatchON = !0, "watch-starting" !== this._watchState && "watch-stopping" !== this._watchState && "watch-on" !== this._watchState && (this._watchState = "watch-starting", this._dispatchEvent("asset-db:watch-state-changed", this._watchState), this._tasks.push({
            name: "watch-on",
            run: r,
            params: [],
            silent: !0
        }, t => {
            this._watchState = "watch-on", this._dispatchEvent("asset-db:watch-state-changed", this._watchState), !1 === this._expectWatchON && this.watchOFF()
        }))
    },
    watchOFF() {
        this._expectWatchON = !1, "watch-starting" !== this._watchState && "watch-stopping" !== this._watchState && "watch-off" !== this._watchState && (this._watchState = "watch-stopping", this._dispatchEvent("asset-db:watch-state-changed", this._watchState), this._tasks.push({
            name: "watch-off",
            run: o,
            params: [],
            silent: !0
        }, t => {
            this._watchState = "watch-off", this._dispatchEvent("asset-db:watch-state-changed", this._watchState), this._expectWatchON && this.watchON()
        }))
    },
    submitChanges(t) {
        if (!this._snapshot) return t && t(new Error("Failed to stop watching asset-db, Already stopped.")), void 0;
        let e = this._mountPaths();
        e = e.map(t => `${t}/**/*`);
        let a = s.create(e),
            h = s.diff(this._snapshot, a),
            n = c(h = s.simplify(h));
        n.length > 0 && (this._snapshot = a, this.syncChanges(n))
    },
    syncChanges(t) {
        this._tasks.push({
            name: "sync-changes",
            run: n,
            params: [t]
        }, (t, e) => {})
    },
    getWatchState() {
        return this._watchState
    }
};