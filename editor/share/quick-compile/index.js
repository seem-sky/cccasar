const e = require("fire-fs"),
    i = require("fire-path"),
    t = require("module-deps"),
    s = require("JSONStream"),
    r = require("concat-stream"),
    o = require("browser-resolve"),
    n = require("async"),
    c = require("del"),
    l = require("xtend"),
    h = require("browserify/lib/builtins.js"),
    a = require("lodash");
require("./plugins/babel"), require("./plugins/module");

function p(e) {
    return e.replace(/\\/g, "/")
}

function d() {
    this._scriptsCache = [], this._parsedScripts = [], this._scriptsToCompile = [], this._missingScripts = [], this._watchedScripts = [], this._mtimes = [], this.state = "idle", this.plugins = [], this.globals = {}, this.exludes = []
}
Object.assign(d.prototype, {
    watch(e, i) {
        this.build(e, () => {
            this._createWatcher(e), i && i()
        })
    },
    _createWatcher(e) {
        console.log("watching...");
        const t = require("chokidar");
        this.watching = !0;
        let s = (e.exts || [".js"]).map(e => i.join(this.root, "**/*" + e)),
            r = t.watch(s, {
                ignored: i.join(this.out, "**"),
                ignoreInitial: !0
            });
        r.on("all", (i, t) => {
            if (t = p(t), "add" === i) return t = [t].concat(this._missingScripts), this.compileScripts(t), void 0;
            this._scriptsCache.find(e => e.src === t) && ("change" === i ? e.onlyRecordChanged ? this._watchedScripts = a.union(this._watchedScripts, [t]) : this.compileScripts(t) : "unlink" === i && this.removeScripts(t))
        }), this.watcher && this.watcher.close(), this.watcher = r
    },
    build(e, i) {
        if (!e.entries || 0 === e.entries.length) return console.error("Please specify the entries"), i();
        this.entries = e.entries.map(p);
        let t = e.root;
        if (!t) return console.error("Please specify the root directory"), i();
        this.root = t;
        let s = e.out;
        if (s || (s = "./quick-compile-temp"), this.out = s, e.clear) try {
            c.sync(s, {
                force: !0
            })
        } catch (e) {
            Editor.error(e)
        }
        e.plugins && Array.isArray(e.plugins) && (this.plugins = e.plugins.concat(this.plugins)), e.exludes && Array.isArray(e.exludes) && (this.exludes = e.exludes.concat(this.exludes)), e.globals && Object.assign(this.globals, e.globals), this.rebuild(i)
    },
    rebuild(e) {
        if (this.updateState("compiling"), this.watching) {
            if (console.time("QuickCompiler watching rebuild finished"), 0 === this._watchedScripts.length) return console.timeEnd("QuickCompiler watching rebuild finished"), e();
            n.each(this._watchedScripts, (e, i) => {
                this._parseEntry(e, !1, i), this._parsedScripts.length = 0, this._watchedScripts.length = 0
            }, i => {
                i && console.error(i), console.timeEnd("QuickCompiler watching rebuild finished"), e()
            })
        } else console.time("QuickCompiler rebuild finished"), n.each(this.entries, (e, i) => {
            this._parseEntry(e, !0, i), this._parsedScripts.length = 0
        }, i => {
            i && console.error(i), console.timeEnd("QuickCompiler rebuild finished"), this._compileFinished(e)
        })
    },
    getRelativePath(e) {
        return p(i.relative(this.root, e))
    },
    getDstPath(e) {
        if (this.isNodeModulePath(e)) return this.getNodeModuleDstPath(e);
        let t = this.getRelativePath(e);
        return p(i.join(this.out, i.stripExt(t) + ".js"))
    },
    isNodeModulePath: e => -1 !== p(e).indexOf("/node_modules/"),
    getNodeModuleDstPath(e) {
        let t = i.join("__node_modules", e.slice(e.indexOf("/node_modules/") + "/node_modules/".length));
        return t = i.stripExt(t) + ".js", i.join(this.out, t)
    },
    updateState(e) {
        this.state = e
    },
    compileScripts(e, i) {
        Array.isArray(e) || (e = [e]), this._scriptsToCompile = a.union(this._scriptsToCompile, e), this._compileScripts(i)
    },
    _compileScripts(e) {
        this.updateState("compiling"), console.time("compileScript"), n.each(this._scriptsToCompile, (e, i) => {
            this._parseEntry(e, !1, i)
        }, i => {
            i && console.error(i), this._scriptsToCompile.length = 0, this._parsedScripts.length = 0, this._compileFinished(() => {
                console.timeEnd("compileScript"), e && e()
            })
        })
    },
    removeScripts(i, t) {
        Array.isArray(i) || (i = [i]);
        let s = i.map(i => {
            let t = this.getDstPath(i);
            e.existsSync(t) && c.sync(t, {
                force: !0
            });
            let s = t + ".info.json";
            return e.existsSync(s) && c.sync(s, {
                force: !0
            }), t
        });
        this._scriptsToCompile = a.pullAll(this._scriptsToCompile, i), this._scriptsCache = this._scriptsCache.filter(e => -1 === s.indexOf(e.src)), this._compileFinished()
    },
    _transform(t) {
        if (this.watching && console.time("_transform: " + t), t = p(t), this.exludes.find(e => t.match(e))) return "";
        let s = this._parsedScripts.find(e => e.src === t);
        if (s) return s.source;
        let r = {
                src: t,
                dst: this.getDstPath(t)
            },
            o = e.statSync(t),
            n = r.dst + ".info.json";
        if (e.existsSync(n)) {
            if (JSON.parse(e.readFileSync(n, "utf8")).mtime === o.mtime.toJSON() && e.existsSync(r.dst)) return r.source = e.readFileSync(r.dst, "utf8"), r.source
        }
        try {
            r.source = e.readFileSync(t, "utf8")
        } catch (e) {
            return console.error(e), void 0
        }
        return this.plugins.forEach(e => {
            if (!this.isNodeModulePath(t) || e.nodeModule || e.transform) try {
                e.transform(r, this)
            } catch (e) {
                console.error(e)
            }
        }), e.ensureDirSync(i.dirname(r.dst)), e.writeFileSync(r.dst, r.source), e.writeFileSync(n, JSON.stringify(o, null, 2)), this.watching && console.timeEnd("_transform: " + t), this._parsedScripts.push(r), r.source
    },
    _isFileInCache(e) {
        return this._scriptsCache.find(i => i.src === e)
    },
    _refineScript(e) {
        e.src = e.file.replace(/\\/g, "/"), e.dst = this.getDstPath(e.src), delete e.file;
        for (let i in e.deps) e.deps[i] = e.deps[i].replace(/\\/g, "/")
    },
    _parseEntry(e, i, c) {
        let d = this._transform(e);
        console.time("parse modules");
        let u = r(t => {
                console.timeEnd("parse modules");
                let s = t.toString();
                s = `{"scripts": ${s}}`;
                let r = [];
                try {
                    r = JSON.parse(s).scripts
                } catch (e) {
                    Editor.error(e)
                }
                let o = this._scriptsCache;
                n.each(r, (t, s) => {
                    if (this._refineScript(t), !i && t.src !== e) return s();
                    let r = o.findIndex(e => e.src === t.src); - 1 === r ? o.push(t) : o.splice(r, 1, t), s()
                }, e => {
                    c(e)
                })
            }),
            m = {
                extensions: [".js", ".json"],
                ignoreMissing: !0
            };
        if (m.resolve = ((e, t, s) => {
                t.paths = require.main.paths.concat(t.paths), o(e, t, (e, t) => {
                    if (!e && (i || !this._isFileInCache(t))) {
                        let e = this._transform(t);
                        m.fileCache[t] = e
                    }
                    s(e, t)
                })
            }), m.modules = l(h), m.persistentCache = ((t, s, r, o, n) => {
                process.nextTick(function () {
                    o(i || t === e ? null : "module.exports = {};", n)
                })
            }), 0 !== Object.keys(this.globals).length) {
            let e = require("insert-module-globals");
            m.globalTransform = (i => e(i, {
                vars: this.globals
            }))
        }
        m.fileCache = {}, m.fileCache[e] = d;
        var f = new t(m);
        f.pipe(s.stringify()).pipe(u), f.write({
            file: e
        }), f.end(), f.on("missing", (e, i) => {
            console.log(`Cannot resolve module [${e}] when parse [${i.filename}]`), this._missingScripts = a.union(this._missingScripts, [p(i.filename)])
        })
    },
    _compileFinished(e) {
        this._scriptsCache = a.sortBy(this._scriptsCache, "file"), n.each(this.plugins, (e, i) => {
            if (!e.compileFinished) return i();
            e.compileFinished(this, i)
        }, i => {
            i && console.error(i), this.onCompileFinished && this.onCompileFinished(i), this.updateState("idle"), e && e()
        })
    }
}), d.prototype._compileScripts = a.debounce(d.prototype._compileScripts, 100), module.exports = d;