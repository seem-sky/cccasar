(() => {
    "use strict";
    require("electron").ipcRenderer.on("app:compile-worker-start", function (e, r) {
        const t = require("fire-path"),
            i = require("async"),
            a = require("globby"),
            o = require("gulp"),
            n = require("del"),
            s = require("fire-fs");
        Editor.isDarwin && require("graceful-fs").gracefulify(require("fs"));
        var u = r.cacheDir ? null : require("browserify"),
            l = r.cacheDir ? require("persistify") : null;
        const p = require("vinyl-source-stream"),
            c = require("vinyl-buffer"),
            d = require("gulp-sourcemaps"),
            f = Editor.require("unpack://engine/gulp/util/utils").uglify,
            g = Editor.require("app://editor/page/refine-sourcemap");
        var m = require("gulp-sequence").use(o);
        const h = s.readFileSync(Editor.url("unpack://static/_prelude.js"), "utf8");
        window.onerror = function (e, r, t, i, a) {
            window.onerror = null;
            var n = a.stack || a;
            if (Editor && Editor.Ipc && Editor.Ipc.sendToMain && Editor.Ipc.sendToMain("metrics:track-exception", n), o && o.isRunning) return o.stop(a), !0;
            Editor && Editor.Ipc && Editor.Ipc.sendToMain && Editor.Ipc.sendToMain("editor:renderer-console-error", n)
        }, Editor.require("app://editor/share/editor-utils"), Editor.require("app://editor/page/asset-db");
        var b = "library/imports",
            v = "Compile error:",
            E = "Cannot find module ";
        r.dest = r.dest || "library/bundle.js", r.platform = r.platform || "editor", r.debug = !!r.debug, r.sourceMaps = "sourceMaps" in r ? r.sourceMaps : r.debug;
        var q = {
            destRoot: r.destRoot,
            dest: r.dest,
            destDir: t.dirname(r.dest),
            proj: t.resolve(r.project)
        };
        q.dest = t.resolve(q.proj, q.dest);
        r.platform;
        if (t.contains(Editor.appPath, q.proj)) {
            return e.reply(null, new Error(`${v} Invalid project path: ${r.project}`).stack), void 0
        }
        console.log("Compiling " + q.proj);
        var y = {},
            w = {};

        function k(e) {
            return t.basenameNoExt(e)
        }
        o.task("do-clean", function (e) {
            var r = t.join(t.dirname(q.dest), t.basenameNoExt(q.dest)) + t.extname(q.dest);
            n(r, {
                force: !0
            }, t => {
                t && Editor.error(`Failed to delete ${r}, press [F7] to try again.`), e(t)
            })
        }), o.task("clean", ["do-clean"], function (e) {
            setTimeout(e, 100)
        });
        let j = {},
            _ = [],
            $ = [],
            x = {},
            M = [];

        function N(e, i, a, n) {
            var s, m = q.proj,
                b = {
                    debug: r.sourceMaps,
                    basedir: m,
                    builtins: ["assert", "buffer", "console", "constants", "crypto", "domain", "events", "http", "https", "os", "path", "punycode", "querystring", "stream", "_stream_duplex", "_stream_passthrough", "_stream_readable", "_stream_transform", "_stream_writable", "string_decoder", "sys", "timers", "tty", "url", "util", "vm", "zlib", "_process"],
                    extensions: [".ts", ".coffee"],
                    ignoreMissing: !0,
                    externalRequireName: "window.__require",
                    prelude: h
                };
            e.sort(),
                function (e) {
                    if (!e._bresolve) {
                        let e = new Error("Failed to patch browserify");
                        return o.isRunning && o.stop(e), void 0
                    }
                    e.__bresolve = e._bresolve, e._bresolve = function r(i, a, o) {
                        e.__bresolve(i, a, function (e, n, s) {
                            if (e) {
                                if (a && a.filename) {
                                    var u = w[a.filename] || w[a.filename.toLowerCase()];
                                    if (u) return a.filename = u, a.basedir = t.dirname(u), r(i, a, o);
                                    console.warn(`Failed to resolve script "${i}" in raw directory: `, a)
                                }
                                return o(null, n, s)
                            }
                            var l = y[n];
                            return l || (l = y[n.toLowerCase()]) && console.log(`resolve "${i}" to "${l}" by ignoring case mistake`), o(null, n = l || n, s)
                        })
                    }
                }(s = r.cacheDir ? l(b, {
                    recreate: r.recreateCache,
                    cacheId: r.platform + "_" + !!r.debug + "_" + !!r.sourceMaps,
                    cacheDir: r.cacheDir
                }) : new u(b));
            for (let r = 0; r < e.length; ++r) {
                var k = e[r];
                s.add(k), s.require(k, {
                    expose: t.basenameNoExt(k)
                })
            }
            for (let r = 0; r < _.length; ++r) {
                let t = _[r]; - 1 === e.indexOf(t) && s.exclude(y[t.toLowerCase()])
            }
            var j = s.bundle().on("error", function (e) {
                e = new Error(function (e) {
                    function r(e, r, t) {
                        if (e.startsWith(r)) {
                            if (!t) return e.slice(r.length);
                            if (e.endsWith(t)) return e.slice(r.length, -t.length)
                        }
                        return ""
                    }
                    var i, a = (e.message || e.toString()).trim();
                    if (!a) return e;
                    if (i = r(a, "ENOENT, open '", ".js'")) {
                        let e = t.basenameNoExt(i);
                        return `${v} Cannot require '${e}', module not found, ${a}`
                    }
                    if (i = r(a, "ENOENT: no such file or directory, open '", ".js'")) {
                        let e = t.basenameNoExt(i);
                        return `${v} Cannot require '${e}', module not found, ${a}`
                    }
                    if (r(a, E)) {
                        let e = E.length + 1,
                            r = a.indexOf("'", e);
                        if (-1 === r) return a;
                        let i = a.slice(e, r);
                        if (t.basename(i) === i && t.extname(i)) return `${v} Cannot require '${i}', module not found, please remove file extension and retry. ( just "require('${t.basenameNoExt(i)}');"`;
                        a = a.replace(E, "Cannot require ") + ". Module not found."
                    }
                    return e.annotated && (a = a + "\n" + e.annotated), v + " " + a
                }(e)), o.isRunning && o.stop(e)
            }).pipe(p(a));
            j = j.pipe(c()), r.sourceMaps && (j = j.pipe(d.init({
                loadMaps: !0
            })));
            var $ = Editor.require("app://editor/share/build-platforms")[r.platform].isNative;
            j = j.pipe(f("build", {
                jsb: $,
                wechatgame: "wechatgame" === r.platform,
                qqplay: "qqplay" === r.platform,
                debug: r.debug
            })), r.sourceMaps && (j = j.pipe(g(y, m)).pipe(d.write("./"))), (j = j.pipe(o.dest(i))).on("end", n)
        }
        o.task("query-sub-packages", function (e) {
            Editor.remote.assetdb.queryMetas("db://assets/**", "folder", (r, i) => {
                (i = i.filter(e => e.isSubpackage)).map(e => {
                    e.path = Editor.remote.assetdb.uuidToFspath(e.uuid)
                });
                for (let e = 0; e < i.length; e++) {
                    let r = i[e];
                    if (0 === $.length) $.push(r);
                    else
                        for (let e = 0; e < $.length; e++) {
                            let i = $[e];
                            t.contains(i.path, r.path) ? Editor.warn(`Already has sub package ${i.path}, ignore sub package ${r.path}`) : t.contains(r.path, i.path) ? (Editor.warn(`Already has sub package ${r.path}, ignore sub package ${i.path}`), $[e] = r) : $.push(r)
                        }
                }
                $.forEach(e => {
                    e.relativePath = t.relative(q.proj, e.path), e.scripts = [];
                    let r = t.join(t.relative(q.destRoot, q.destDir), e.relativePath) + ".js",
                        i = e.subpackageName;
                    i || (i = t.basenameNoExt(e.path)), x[i] = {
                        name: i,
                        path: r.replace(/\\/g, "/")
                    }
                }), e()
            })
        }), o.task("get-scripts", function (e) {
            (function (e) {
                var r = t.join(b, "**/*.js"),
                    i = q.proj,
                    o = {
                        cwd: i
                    };

                function n(e) {
                    return t.relative(o.cwd, e)
                }

                function s(e, r, t) {
                    e[r] = t;
                    let i = r.toLowerCase();
                    i in e || (e[i] = t)
                }
                a(r, o, (r, a) => {
                    if (r) return e(r);
                    for (var o = 0; o < a.length; o++) {
                        var u = a[o],
                            l = k(u),
                            p = Editor.assetdb.remote.uuidToFspath(l);
                        if (!p) {
                            Editor.warn("Can not get fspath of: " + l + " from assetdb, but script found in library.");
                            continue
                        }
                        var c = t.resolve(i, u);
                        s(w, c, p), s(y, p, c);
                        var d = t.basenameNoExt(p),
                            f = j[d];
                        if (f) {
                            var g = n(p),
                                m = n(f),
                                h = new Error(`${v} Filename conflict, the module "${d}" both defined in "${g}" and "${m}"`);
                            return e(h)
                        }
                        j[d] = p;
                        let r = !1;
                        for (let e = 0; e < $.length; e++) t.contains($[e].path, p) && ($[e].scripts.push(p), r = !0);
                        r || M.push(p), _.push(p)
                    }
                    e()
                })
            })(e)
        }), o.task("browserify-main-package", function (e) {
            console.log("Output main package : " + q.dest);
            var r = t.basename(q.dest);
            N(M, q.destDir, r, function () {
                e()
            })
        }), o.task("browserify-sub-packages", function (e) {
            if (0 === $.length) return e();
            i.eachSeries($, (e, r) => {
                let i = t.dirname(e.relativePath);
                var a = t.join(q.destDir, i),
                    o = t.basename(e.path) + ".js";
                console.log("Output sub package : " + t.join(a, o)), N(e.scripts, a, o, function () {
                    r()
                })
            }, r => {
                e()
            })
        }), o.task("compile", m("clean", "query-sub-packages", "get-scripts", "browserify-main-package", "browserify-sub-packages")), o.start("compile", function (r) {
            if (r) {
                var t = Editor.Utils.toString(r);
                if ("string" == typeof r.stack) {
                    if (!(r = r.stack).startsWith(t)) {
                        var i = /^.*/.exec(t)[0];
                        r.startsWith(i) && (r = (r = r.slice(i.length)).trimLeft()), r = t + "\n" + r
                    }
                    r.startsWith("Error: " + v) && (r = r.slice("Error: ".length))
                } else r = t
            }
            e.reply(null, r, x), console.log("Compile Worker Finished")
        })
    })
})();