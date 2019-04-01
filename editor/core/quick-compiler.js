const e = require("fire-fs"),
    t = require("fire-path"),
    i = require("module-deps"),
    r = require("JSONStream"),
    s = require("concat-stream"),
    o = require("browser-resolve"),
    a = require("globby"),
    n = require("async"),
    p = require("del"),
    c = require("xtend"),
    l = require("browserify/lib/builtins.js"),
    h = require("insert-module-globals"),
    d = require("lodash"),
    u = "preview-scripts";

function m(i, r) {
    let s = i.src,
        o = i.dest,
        a = i.relative,
        n = i.rawPath,
        p = i.through;
    if (".json" === t.extname(s) && ".json" === t.extname(o)) return e.copySync(s, o), r();
    let c = s + ".map",
        l = e.existsSync(c),
        h = t.basenameNoExt(o),
        d = '(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};' + `var __filename = '${t.join(u,a).replace(/\\/g,"/")}';` + "var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {",
        m = `\n        }\n        if (CC_EDITOR) {\n            __define(__module.exports, __require, __module);\n        }\n        else {\n            cc.registerModuleFunc(__filename, function () {\n                __define(__module.exports, __require, __module);\n            });\n        }\n        })();\n        ${l?`//# sourceMappingURL=${h}.js.map`:""}\n        `;

    function f(i, a) {
        if (".json" === t.extname(s) && ".js" === t.extname(o) && (a = "module.exports = " + a), -1 === a.indexOf("cc._RF.push") ? d += `cc._RF.push(module, '', '${h}', __filename);` : a = a.replace(/\bcc._RF.push\b\ *\(([^)]*)\)/g, function (e, t) {
                return `cc._RF.push(${t}, __filename)`
            }), -1 === a.indexOf("cc._RF.pop") && (m = "\ncc._RF.pop();" + m), a = d + a + m, e.ensureDirSync(t.dirname(o)), e.writeFileSync(o, a), !l) return r();
        let p = t.extname(n),
            u = JSON.parse(e.readFileSync(c, "utf8"));
        u.sources = [`${h}${p}`], u = JSON.stringify(u);
        let f = o + ".map";
        e.writeFileSync(f, u), r()
    }
    p ? p(s, f) : e.readFile(s, "utf8", f)
}
var f = {
    state: "idle",
    scripts: [],
    scriptsCache: [],
    nameToPathMap: {},
    errorScripts: {},
    _depsStack: [],
    _pathsToUpdate: [],
    _scriptsToCompile: [],
    getAssetDb: () => Editor.isMainProcess ? Editor.assetdb : Editor.remote.assetdb,
    getTempPath: () => t.join(Editor.Project.path, "temp/quick-scripts"),
    getRelativePath(e) {
        let i = this.getAssetDb().mountInfoByPath(e);
        return t.join(i.mountPath, t.relative(i.path, e))
    },
    getRawPathToTempPath(e) {
        let i = this.getRelativePath(e);
        return t.join(this.getTempPath(), t.stripExt(i) + ".js")
    },
    isScript: function (e) {
        return "javascript" === e || "coffeescript" === e || "typescript" === e
    },
    isPlugin: function (e) {
        var t = this.getAssetDb()._uuid2meta[e] || this.getAssetDb().loadMetaByUuid(e);
        return t && t.isPlugin
    },
    needCompile: function (e, t) {
        return "javascript" === e ? !this.isPlugin(t) : "coffeescript" === e || "typescript" === e
    },
    updateState(e) {
        this.state = e, Editor.Ipc.sendToWins("compiler:state-changed", e)
    },
    init(e) {
        let i = this.getTempPath();
        try {
            p.sync(i, {
                force: !0
            })
        } catch (e) {
            Editor.error(e)
        }
        console.time("init QuickCompiler"), this.updateState("compiling");
        let r = [t.join(Editor.Project.path, "library/imports", "/**/*.js")];
        a(r, (t, i) => {
            this.nameToPathMap = {}, n.each(i, (e, t) => {
                this.copyImportToTemp(e, t)
            }, t => {
                this.updateScriptsCache(() => {
                    e && e(), console.timeEnd("init QuickCompiler"), this.updateState("idle")
                })
            })
        })
    },
    compileAndReload() {
        this.init(() => {
            this.reloadScripts()
        })
    },
    copyImportToTemp(e, i) {
        let r = this.getTempPath(),
            s = t.basenameNoExt(e);
        if (this.isPlugin(s)) return i();
        let o = this.getAssetDb().uuidToFspath(s),
            a = this.getRelativePath(o),
            n = t.join(r, a);
        a = t.stripExt(a) + ".js", n = t.stripExt(n) + ".js", this._pathsToUpdate.push(n), this.nameToPathMap[t.basenameNoExt(n).toLowerCase()] = n, m({
            src: e,
            dest: n,
            relative: a,
            rawPath: o
        }, i)
    },
    getNodeModulePathInfo(e) {
        let i = this.getTempPath(),
            r = t.join("__node_modules", e.substring(e.indexOf("/node_modules/") + "/node_modules/".length, e.length));
        return {
            relative: r = t.stripExt(r) + ".js",
            dest: t.join(i, r)
        }
    },
    updateNodeModules(e, t) {
        for (let t in e.deps) {
            let i = e.deps[t];
            if (this.isNodeModulePath(i)) {
                let r = this.getNodeModulePathInfo(i);
                e.deps[t] = r.dest
            }
        }
        this.isNodeModulePath(e.file) ? (e.isNodeModule = !0, this.copyNodeModuleToTemp(e, t)) : t && t()
    },
    copyNodeModuleToTemp(e, t) {
        this.getTempPath();
        let i = e.file,
            r = this.getNodeModulePathInfo(i);
        e.file = r.dest;
        m({
            src: i,
            dest: r.dest,
            relative: r.relative,
            rawPath: i,
            through: function (t, i) {
                i(null, e.source)
            }
        }, t)
    },
    singleScriptCompileFailed: function (e) {
        let t = this.errorScripts[e.uuid];
        t || (t = this.errorScripts[e.uuid] = []), t.push(e.error.toString()), this.updateState("failed")
    },
    compileScripts(e, t) {
        e.forEach(e => {
            -1 === this._scriptsToCompile.indexOf(e) && this._scriptsToCompile.push(e)
        }), this._compileScripts(t)
    },
    _compileScripts(t) {
        var i = this._scriptsToCompile;
        this.updateState("compiling"), n.each(i, (t, i) => {
            if (this.isPlugin(t)) return i();
            let r = this.getAssetDb()._uuidToImportPathNoExt(t) + ".js";
            if (!e.existsSync(r)) return Editor.error(`Can not find import path [${r}]`), i();
            this.copyImportToTemp(r, e => {
                if (e) return Editor.error(`Copy ${r} to temp path failed`), i();
                let s = this.errorScripts[t];
                s && (s.forEach(e => {
                    Editor.clearLog(e)
                }), delete this.errorScripts[t]), i()
            })
        }, e => {
            e && Editor.error(e), i.length = 0, console.time("compileScript"), this.updateScriptsCache(() => {
                this.reloadScripts(), this.updateState("idle"), console.timeEnd("compileScript"), t && t()
            })
        })
    },
    scriptUuidChanged(e, t) {
        this.errorScripts[e] && (this.errorScripts[t] = this.errorScripts[e], delete this.errorScripts[e])
    },
    reloadScripts() {
        Editor.Ipc.sendToWins("scene:soft-reload", !0)
    },
    moveScripts(e, t) {
        this.removeScripts(e, t), this.compileScripts(t)
    },
    removeScripts(i, r) {
        let s = i.map(i => {
            let r = this.getRawPathToTempPath(i);
            r = r.replace(/\\/g, "/"), e.existsSync(r) && p.sync(r, {
                force: !0
            });
            let s = r + ".map";
            e.existsSync(s) && p.sync(s, {
                force: !0
            });
            let o = t.basenameNoExt(r);
            return delete this.nameToPathMap[o.toLowerCase()], r
        });
        this._scriptsToCompile = this._scriptsToCompile.filter(e => -1 === r.indexOf(e)), this.scriptsCache = this.scriptsCache.filter(e => -1 === s.indexOf(e.file)), this.resortScripts()
    },
    makePathToMacPath(e) {
        e.file = e.file.replace(/\\/g, "/");
        for (let t in e.deps) e.deps[t] = e.deps[t].replace(/\\/g, "/")
    },
    isNodeModulePath: e => -1 !== e.replace(/\\/g, "/").indexOf("/node_modules/"),
    updateScriptsCache(a) {
        let p = this._pathsToUpdate,
            d = s(e => {
                let t = e.toString();
                t = `{"scripts": ${t}}`;
                let i = [];
                try {
                    i = JSON.parse(t).scripts
                } catch (e) {
                    Editor.error(e)
                }
                let r = this.scriptsCache;
                n.each(i, (e, t) => {
                    this.makePathToMacPath(e), this.updateNodeModules(e, () => {
                        let i = r.findIndex(t => t.file === e.file); - 1 === i ? r.push(e) : r.splice(i, 1, e), t()
                    })
                }, e => {
                    this.resortScripts(), a && a(e)
                })
            });
        var u = {
            extensions: [".js", ".json"],
            ignoreMissing: !0
        };
        u.resolve = ((e, i, r) => {
            let s = t.basename(e);
            s.endsWith(".js") ? s = s.slice(0, -3) : s.endsWith(".json") && (s = s.slice(0, -5));
            let a = this.nameToPathMap[s.toLowerCase()];
            if (!this.isNodeModulePath(i.filename) && a) return r(null, a);
            i.paths = require.main.paths.concat(i.paths), o(e, i, r)
        }), u.modules = c(l);
        var m = {
            process: function () {
                return "require('_process')"
            }
        };
        u.globalTransform = function (e) {
            return h(e, {
                vars: m
            })
        }, u.fileCache = {}, n.eachSeries(p, (t, i) => {
            e.readFile(t, "utf8", (e, r) => {
                e ? Editor.error(e) : u.fileCache[t] = r, i()
            })
        }, () => {
            var e = new i(u);
            e.pipe(r.stringify()).pipe(d);
            for (let t = 0; t < p.length; t++) e.write({
                file: p[t]
            });
            p.length = 0, e.end()
        })
    },
    resortScripts() {
        let e = this.getTempPath(),
            i = this.scriptsCache = d.sortBy(this.scriptsCache, "file");
        this.scripts = i.map(r => {
            let s = {};
            for (let e in r.deps) s[e] = i.findIndex(function (t) {
                return t.file === r.deps[e]
            });
            return {
                isNodeModule: r.isNodeModule,
                deps: s,
                file: t.join(u, t.relative(e, r.file)).replace(/\\/g, "/")
            }
        })
    }
};
if (f._compileScripts = d.debounce(f._compileScripts, 100), Editor.isMainProcess) {
    require("electron").ipcMain.on("app:query-status", function () {
        Editor.Ipc.sendToWins("compiler:state-changed", f.state)
    })
}
module.exports = f;