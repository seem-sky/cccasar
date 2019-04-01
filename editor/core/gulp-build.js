const e = require("fire-path"),
    t = require("fire-url"),
    i = require("fire-fs"),
    {
        format: s,
        promisify: n
    } = require("util"),
    r = require("electron").ipcMain,
    o = require("globby"),
    a = require("gulp").Gulp,
    c = require("gulp-rename"),
    l = require("gulp-util"),
    u = require("event-stream"),
    d = require("stream-combiner2"),
    p = require("gulp-sequence"),
    m = require("gulp-rev-all"),
    f = require("gulp-rev-delete-original"),
    g = require("del"),
    b = (require("async"), require("lodash")),
    j = require("winston"),
    h = require("crypto"),
    v = require("./compiler"),
    w = require("./native-utils"),
    y = require("../share/build-platforms"),
    E = require("./build-results"),
    k = "build-platform_",
    S = "db://",
    q = "window._CCSettings",
    x = 5;

function O(t) {
    return u.through(function (i) {
        if (".html" === e.extname(i.path)) {
            j.normal("Generating html from " + i.path);
            var s = t.webOrientation;
            "auto" === s && (s = "");
            const r = Editor.url("app://node_modules/vConsole/dist/vconsole.min.js"),
                o = `<script src="${e.basename(r)}"><\/script>`;
            var n = {
                file: i,
                project: t.projectName || e.basename(t.project),
                previewWidth: t.previewWidth,
                previewHeight: t.previewHeight,
                orientation: s,
                webDebugger: t.embedWebDebugger ? o : ""
            };
            i.contents = new Buffer(l.template(i.contents, n))
        } else if ("main.js" === e.basename(i.path)) {
            j.normal("Generating main.js from " + i.path);
            let e = i.contents.toString(),
                s = "";
            t.includeAnySDK && (s = "    \n    if (cc.sys.isNative && cc.sys.isMobile) {\n        jsList = jsList.concat(['src/anysdk/jsb_anysdk.js', 'src/anysdk/jsb_anysdk_constants.js']);\n    }\n"), e = e.replace(/<Inject anysdk scripts>/g, s);
            let o = "qqplay" === t.platform;
            if (o && t.qqplay && t.qqplay.REMOTE_SERVER_ROOT) {
                let i = 'qqPlayDownloader.REMOTE_SERVER_ROOT = "' + t.qqplay.REMOTE_SERVER_ROOT + '"';
                e = e.replace(/qqPlayDownloader.REMOTE_SERVER_ROOT = ""/g, i)
            }
            let a = "wechatgame-subcontext" === t.platform,
                c = "wechatgame" === t.platform || a;
            n = {
                file: i,
                renderMode: t.renderMode,
                isWeChatGame: c,
                isWeChatSubdomain: a,
                isQQPlay: o,
                engineCode: "",
                projectCode: ""
            };
            if (o) {
                var r = t.debug;
                n.engineCode = r ? "'GameRes://cocos2d-js.js'" : "'GameRes://cocos2d-js-min.js'", n.projectCode = r ? "'GameRes://src/project.dev.js'" : "'GameRes://src/project.js'"
            }
            i.contents = new Buffer(l.template(e, n))
        }
        this.emit("data", i)
    })
}

function R(e, t) {
    var i = JSON.stringify(e, null, t ? 4 : 0).replace(/"([A-Za-z_$][0-9A-Za-z_$]*)":/gm, "$1:");
    return i = t ? `${q} = ${i};\n` : `${q}=${i};`
}

function M(e, i) {
    var s = e.customSettings,
        n = e.debug,
        r = Object.create(null),
        o = !e.preview,
        a = Editor.assetdb,
        c = Editor.assets,
        l = Editor.Utils.UuidUtils.compressUuid;

    function u(e, i, s, n) {
        if (!e) return console.error("can not get url to build: " + i), null;
        if (!e.startsWith(S)) return console.error("unknown url to build: " + e), null;
        var r = Editor.assetdb.isSubAssetByUuid(i);
        if (r) {
            var o = t.dirname(e),
                a = t.extname(o);
            a && (o = o.slice(0, -a.length)), e = o
        }
        var c = e.indexOf("/", S.length);
        if (c < 0) return console.error("no mount to build: " + e), null;
        var l = e.slice(S.length, c);
        if (!l) return console.error("unknown mount to build: " + e), null;
        var u = e.slice(c + 1);
        return u ? ("audio-clip" === s && (n || (n = Editor.assetdb.loadMetaByUuid(i)), n && "1" === n.downloadMode && (u += "?useDom=1")), {
            mountPoint: l,
            relative: u,
            uuid: i,
            isSubAsset: r
        }) : (console.error("unknown relative to build: " + e), null)
    }
    console.time("queryAssets"),
        function (e, t) {
            var i = y[s.platform].isNative;
            if (e) {
                for (var n = [], r = 0, o = e.length; r < o; r++) {
                    var l = e[r],
                        d = a.uuidToUrl(l),
                        p = a.assetInfoByUuid(l);
                    if (p) {
                        var m = p.type;
                        if (m) {
                            var f = u(d, l, m);
                            if (!f) continue;
                            var g = c[m];
                            f.ctor = g || cc.RawAsset, n.push(f)
                        } else console.error("Can not get asset type of " + l)
                    } else console.error("Can not get asset info of " + l)
                }
                a.queryMetas("db://**/*", "javascript", function (e, s) {
                    var r;
                    r = i ? e => e.isPlugin && e.loadPluginInNative : e => e.isPlugin && e.loadPluginInWeb;
                    var o = s.filter(r).map(e => e.uuid);
                    t(null, n, o)
                })
            } else console.time("queryMetas"), a.queryMetas("db://**/*", "", function (e, s) {
                console.timeEnd("queryMetas");
                for (var n = [], r = [], o = 0, l = s.length; o < l; o++) {
                    var d = s[o],
                        p = d.assetType();
                    if ("folder" !== p) {
                        "javascript" === p && d.isPlugin && (i ? d.loadPluginInNative && r.push(d.uuid) : d.loadPluginInWeb && r.push(d.uuid));
                        var m = d.uuid,
                            f = u(a.uuidToUrl(m), m, p, d);
                        if (f && f.relative.startsWith("resources/")) {
                            var g = c[p];
                            f.ctor = g || cc.RawAsset, n.push(f)
                        }
                    }
                }
                t(e, n, r)
            })
        }(e.uuidList, function (t, c, u) {
            if (console.timeEnd("queryAssets"), t) return i(t);
            console.time("writeAssets"),
                function (e, t) {
                    var i, s = cc.RawAsset,
                        r = e.rawAssets = {
                            assets: {}
                        };
                    n || (i = e.assetTypes = []);
                    var a = {};
                    t = b.sortBy(t, "relative");
                    for (var c = Object.create(null), u = 0, d = t.length; u < d; u++) {
                        var p = t[u],
                            m = p.mountPoint;
                        if (!p.ctor || s.isRawAssetType(p.ctor)) {
                            Editor.error(`Failed to get ctor of '${p.relative}'(${p.uuid}).\n` + "Since 1.10, if the asset is RawAsset, refactor to normal Asset please.\nIf not RawAsset, please ensure the class of asset is loaded in the main process of the editor.");
                            continue
                        }
                        if (!p.relative.startsWith("resources/")) continue;
                        if (p.isSubAsset && cc.js.isChildClassOf(p.ctor, cc.SpriteFrame)) {
                            var f, g = p.relative;
                            if (g in c) f = c[g];
                            else {
                                let e = g + ".";
                                f = t.some(function (t) {
                                    var i = t.relative;
                                    return (i === g || i.startsWith(e)) && !t.isSubAsset && t.ctor === cc.SpriteAtlas
                                }), c[g] = f
                            }
                            if (f) continue
                        }
                        var j = r[m];
                        j || (j = r[m] = {});
                        var h, v = cc.js._getClassId(p.ctor, !1);
                        if (!n) {
                            var w = a[v];
                            void 0 === w && (i.push(v), w = i.length - 1, a[v] = w), v = w
                        }
                        var y = p.relative.slice("resources/".length);
                        h = p.isSubAsset ? [y, v, 1] : [y, v];
                        let e = p.uuid;
                        o && (e = l(e, !0)), j[e] = h
                    }
                }(s, c), console.timeEnd("writeAssets"),
                function (e, t) {
                    for (var i = [], s = 0; s < t.length; s++) {
                        var n = t[s],
                            o = a.uuidToUrl(n);
                        o = o.slice(S.length), r[o] = n, i.push(o)
                    }
                    i.sort(), i.length > 0 && (e.jsList = i)
                }(s, u), e.sceneList.length > 0 && (s.launchScene = Editor.assetdb.uuidToUrl(e.sceneList[0])),
                function (e, t) {
                    t = t.map(e => {
                        var t = Editor.assetdb.uuidToUrl(e);
                        return t ? (o && (e = l(e, !0)), {
                            url: t,
                            uuid: e
                        }) : (Editor.warn(`Can not get url of scene ${e}, it maybe deleted.`), null)
                    }).filter(Boolean), e.scenes = t
                }(s, e.sceneList), s.packedAssets = function (e) {
                    if (o && e) {
                        var t = {};
                        for (var i in e) {
                            var s = e[i];
                            t[i] = s.map(e => l(e, !0))
                        }
                        e = t
                    }
                    return e
                }(e.packedAssets) || {}, s.md5AssetsMap = {}, s.orientation = e.webOrientation, n && (s.debug = !0), s.subpackages = e.subpackages, s.server = e.server, (!("stringify" in e) || e.stringify) && (s = R(s, n)), i(null, s, r)
        })
}
exports.startWithArgs = function (t, S) {
    function A(e) {
        _.isRunning ? _.stop(e) : Editor.error(e)
    }
    var C, _ = new a,
        T = p.use(_),
        U = t.project,
        D = t.projectName || e.basename(U),
        $ = t.platform,
        B = t.actualPlatform,
        L = !!t.nativeRenderer,
        F = "wechatgame-subcontext" === $,
        W = "wechatgame" === $ || F,
        I = !!t.debug,
        N = t.sourceMaps,
        P = "qqplay" === t.platform;
    if (F) {
        let i = e.dirname(t.dest);
        t.dest = e.join(i, D)
    }
    P ? C = t.qqplay.orientation : "auto" === (C = t.webOrientation) && (C = "");
    var J = t.debugBuildWorker,
        G = y[$].isNative,
        V = t.dest;
    if (Editor.log("Building " + U), Editor.log("Destination " + V), e.normalize(V) === e.normalize(U)) return S(new Error("Can not export project at project folder."));
    if (e.contains(Editor.App.path, V)) return S(new Error("Can not export project to fireball app folder."));
    var H = {
        tmplBase: e.resolve(Editor.url("unpack://static"), "build-templates"),
        jsCacheDir: Editor.url("unpack://engine/bin/.cache/" + $)
    };
    let z;
    var Q;
    Object.assign(H, {
        template_shares: e.join(H.tmplBase, "shares/**/*"),
        template_web_desktop: e.join(H.tmplBase, I ? "web-desktop/template-dev/**/*" : "web-desktop/template/**/*"),
        template_web_mobile: e.join(H.tmplBase, I ? "web-mobile/template-dev/**/*" : "web-mobile/template/**/*"),
        bundledScript: e.join(V, "src", I ? "project.dev.js" : "project.js"),
        src: e.join(V, "src"),
        res: e.join(V, "res"),
        settings: e.join(V, "src/settings.js"),
        jsCache: e.join(H.jsCacheDir, I ? G ? "cocos2d-jsb.js" : "cocos2d-js.js" : G ? "cocos2d-jsb-min.js" : "cocos2d-js-min.js"),
        jsCacheExcludes: e.join(H.jsCacheDir, I ? ".excludes" : ".excludes-min"),
        webDebuggerSrc: Editor.url("app://node_modules/vconsole/dist/vconsole.min.js"),
        template_instant_games: e.join(H.tmplBase, "fb-instant-games/**/*"),
        quickScripts: e.join(U, "temp/quick-scripts"),
        destQuickScripts: e.join(V, "scripts")
    }), _.task("compile", function (e) {
        Editor.Ipc.sendToMain("builder:state-changed", "compile", .1);
        var t = {
            project: U,
            platform: $,
            actualPlatform: B,
            destRoot: V,
            dest: H.bundledScript,
            debug: I,
            sourceMaps: N
        };
        v._runTask(t, function (t, i) {
            t ? A(t) : (z = i, e())
        })
    }), _.task("build-assets", ["compile"], function (e) {
        var i;
        Editor.log("Start building assets"), Editor.Ipc.sendToMain("builder:state-changed", "spawn-worker", .3), Q = new E;

        function s(t, s) {
            if (i && !J) {
                var n = i;
                i = null, n.nativeWin.destroy()
            }
            _.isRunning ? e(new Error(s)) : Editor.error(s)
        }
        r.once("app:build-project-abort", s), j.normal("Start spawn build-worker");
        var n = !1;
        Editor.App.spawnWorker("app://editor/page/build/build-worker", function (o, a) {
            var c;
            j.normal("Finish spawn build-worker"), i = o, n || (n = !0, a.once("closed", function () {
                c || (r.removeListener("app:build-project-abort", s), Editor.log("Finish building assets"), e())
            })), j.normal("Start init build-worker"), Editor.Ipc.sendToMain("builder:state-changed", "init-worker", .32), i.send("app:init-build-worker", $, I, function (e) {
                function s() {
                    !i || J || (i.close(), i = null)
                }
                e ? (A(e), c = !0, s()) : i && (j.normal("Finish init build-worker"), j.normal("Start build-assets in worker"), Editor.Ipc.sendToMain("builder:state-changed", "build-assets", .65), i.send("app:build-assets", H.res, $, I, b.pick(t, "scenes", "inlineSpriteFrames", "mergeStartScene", "optimizeHotUpdate", "wechatgame"), function (e, t, i) {
                    e ? (A(e), c = !0) : t && (Q._buildAssets = t, Q._packedAssets = i), j.normal("Finish build-assets in worker"), s()
                }, -1))
            }, -1)
        }, J, !0)
    });
    var K = null,
        X = null;
    _.task("build-settings", ["build-assets"], function (e) {
        var i = Editor.Profile.load("profile://project/project.json");
        let s = {
            stringify: !1,
            customSettings: {
                platform: $,
                groupList: i.data["group-list"],
                collisionMatrix: i.data["collision-matrix"]
            },
            sceneList: t.scenes,
            uuidList: Q.getAssetUuids(),
            packedAssets: Q._packedAssets,
            webOrientation: C,
            debug: I,
            subpackages: z
        };
        "android-instant" === t.platform && (s.server = t["android-instant"].REMOTE_SERVER_ROOT), M(s, function (t, i, s) {
            t ? A(t) : (K = i, X = s, e())
        })
    });
    let Z = null;

    function Y(e, i) {
        var s = [H.template_shares, e];
        return _.src(s).pipe(O(t)).pipe(_.dest(V)).on("end", i)
    }
    _.task("compress-settings", function () {
        if (I) return;
        let e = {};
        (function () {
            let t = K.uuids = [],
                i = {};

            function s(s) {
                var n = (i[s] || 0) + 1;
                i[s] = n, n >= 2 && !(s in e) && (e[s] = t.length, t.push(s))
            }
            let n = K.rawAssets;
            for (let e in n) {
                let t = n[e];
                for (let e in t) s(e)
            }
            let r = K.scenes;
            for (let e = 0; e < r.length; ++e) s(r[e].uuid);
            let o = K.packedAssets;
            for (let e in o) o[e].forEach(s);
            let a = K.md5AssetsMap;
            for (let e in a) {
                let t = a[e];
                for (let e = 0; e < t.length; e += 2) s(t[e])
            }
        })();
        let i = K.rawAssets,
            s = K.rawAssets = {};
        for (let t in i) {
            let r = i[t],
                o = s[t] = {};
            for (let t in r) {
                var n = r[t];
                let i = e[t];
                void 0 !== i && (t = i), o[t] = n
            }
        }
        let r = K.scenes;
        for (let t = 0; t < r.length; ++t) {
            let i = r[t],
                s = e[i.uuid];
            void 0 !== s && (i.uuid = s)
        }
        let o = K.packedAssets;
        for (let t in o) {
            let i = o[t];
            for (let t = 0; t < i.length; ++t) {
                let s = e[i[t]];
                void 0 !== s && (i[t] = s)
            }
        }
        if (t.md5Cache) {
            let t = K.md5AssetsMap;
            for (let i in t) {
                let s = t[i];
                for (let t = 0; t < s.length; t += 2) {
                    let i = e[s[t]];
                    void 0 !== i && (s[t] = i)
                }
            }
            Z = function (e) {
                var t = e.uuids,
                    i = e.md5AssetsMap;
                for (var s in i)
                    for (var n = i[s], r = 0; r < n.length; r += 2) "number" == typeof n[r] && (n[r] = t[n[r]])
            }
        }
    }), _.task("build-web-desktop-template", function (e) {
        Y(H.template_web_desktop, e)
    }), _.task("build-web-mobile-template", function (e) {
        Y(H.template_web_mobile, e)
    }), _.task("build-fb-instant-games-template", function (e) {
        Y(H.template_instant_games, e)
    }), _.task("build-plugin-scripts", ["build-settings"], function () {
        Editor.log("Start building plugin scripts");
        var t = Editor.assetdb,
            i = [];
        for (var s in X) {
            var n = X[s];
            let c = t.uuidToFspath(n);
            var r = e.dirname(e.join(H.src, s));
            console.log(`start gulpping ${c} to ${r}`);
            var o = _.src(c);
            if (!I) {
                var a = Editor.require("unpack://engine/gulp/util/utils").uglify;
                o = o.pipe(a("build", {
                    jsb: G,
                    debug: I,
                    wechatgame: W,
                    qqplay: P
                })), d.obj([o]).on("error", function (e) {
                    A(e.message)
                })
            }
            o = o.pipe(_.dest(r)).on("end", () => {
                console.log("finish gulpping", c)
            }), i.push(o)
        }
        return i.length > 0 ? u.merge(i).on("end", () => {
            Editor.log("Finish building plugin scripts")
        }) : null
    }), _.task("copy-main-js", function () {
        return _.src([e.join(H.tmplBase, "shares/main.js")]).pipe(O(t)).pipe(_.dest(V))
    }), _.task("import-script-statically", function (t) {
        var s, n = e.join(V, "main.js"),
            r = i.readFileSync(n, "utf8");
        if (P && K.jsList && K.jsList.length > 0) {
            s = "\n// plugin script code\n";
            var o = H.src;
            if (K.jsList.map(t => {
                    let i = e.relative(V, e.resolve(o, t));
                    Editor.isWin32 && (i = i.replace(/\\/g, "/")), s += `BK.Script.loadlib('GameRes://${i}'); \n`
                }), s = r.replace("<Inject plugin code>", s), K.jsList = void 0, s === r) return t("Inject plugin code failure for qqplay"), void 0
        } else s = r.replace("<Inject plugin code>", "");
        i.writeFileSync(n, s), t()
    }), _.task("copy-build-template", function (s) {
        Editor.Ipc.sendToMain("builder:state-changed", "copy-build-templates", .98);
        let n = e.basename(t.dest),
            r = e.join(t.project, "build-templates");
        if (!i.existsSync(r)) return s();
        let a = e.join(r, n, "**");
        o(a, (n, o) => {
            (o = o.map(t => e.resolve(t))).forEach(s => {
                let n = e.relative(r, s),
                    o = e.join(t.buildPath, n);
                i.ensureDirSync(e.dirname(o)), i.copySync(s, o)
            }), s && s(n)
        })
    }), _.task("build-common", ["compile", "build-assets", "build-settings", "build-plugin-scripts"]);
    var ee = require(Editor.url("unpack://engine/gulp/tasks/engine"));

    function te(t) {
        var s = e.basename(t),
            n = e.dirname(t),
            r = e.join(n, s);
        const o = i.readFileSync(r);
        var a = h.createHash("md5").update(o).digest("hex");
        a = a.slice(0, x);
        var c, u = e.basename(n);
        if (Editor.Utils.UuidUtils.isUuid(u)) {
            var d = n + "." + a;
            c = e.join(d, s);
            try {
                i.renameSync(n, d)
            } catch (e) {
                l.log(`[31m[MD5 ASSETS] write file error: ${e.message}[0m`)
            }
        } else {
            var p = s.lastIndexOf("."),
                m = ~p ? `${s.slice(0,p)}.${a}${s.slice(p)}` : `${s}.${a}`;
            c = e.join(n, m);
            try {
                i.renameSync(r, c)
            } catch (e) {
                l.log(`[31m[MD5 ASSETS] write file error: ${e.message}[0m`)
            }
        }
        return {
            hash: a,
            path: c
        }
    }
    async function ie(t) {
        const i = Editor.Utils.UuidUtils.getUuidFromLibPath,
            s = Editor.Utils.UuidUtils.compressUuid,
            r = [];
        for (var a = await n(o)(t, {
                nodir: !0
            }), c = 0; c < a.length; ++c) {
            var l = a[c],
                u = i(e.relative(V, l));
            u ? r.push(s(u, !0), te(l).hash) : Editor.warn(`Can not resolve uuid for path "${l}", skip the MD5 process on it.`)
        }
        return r
    }
    _.task("build-cocos2d", function (s) {
            Editor.Ipc.sendToAll("builder:state-changed", "cut-engine", 0);
            var n = G ? e.join(V, "src") : V;
            i.ensureDirSync(H.jsCacheDir), t.excludedModules = t.excludedModules ? t.excludedModules.sort() : [];
            var r = !1;
            if (i.existsSync(H.jsCacheExcludes)) {
                let e = i.readJSONSync(H.jsCacheExcludes);
                e.excludes && e.version && (r = Editor.versions.cocos2d === e.version && L === e.nativeRenderer && e.excludes.toString() === t.excludedModules.toString() && e.sourceMaps === t.sourceMaps)
            }

            function o() {
                var e = [H.jsCache];
                N && e.push(H.jsCache + ".map");
                var t = _.src(e);
                return G && (t = t.pipe(c("cocos2d-jsb.js"))), t = t.pipe(_.dest(n))
            }
            if (r && i.existsSync(H.jsCache)) return o().on("end", s), void 0;
            var a = [],
                l = require(Editor.url("unpack://engine/modules.json"));
            l && l.length > 0 && (t.excludedModules && t.excludedModules.forEach(function (t) {
                    l.some(function (i) {
                        if (i.name === t) return i.entries && i.entries.forEach(function (t) {
                            a.push(e.join(Editor.url("unpack://engine"), t))
                        }), !0
                    })
                }), "wechatgame-subcontext" === $ && l.forEach(t => {
                    ("WebGL Renderer" === t.name || t.dependencies && -1 !== t.dependencies.indexOf("WebGL Renderer")) && t.entries && t.entries.forEach(function (t) {
                        a.push(e.join(Editor.url("unpack://engine"), t))
                    })
                }), console.log("Exclude modules: " + a)),
                function (e, i, s) {
                    ee[I ? G ? "buildJsb" : "buildCocosJs" : G ? "buildJsbMin" : "buildCocosJsMin"](Editor.url("unpack://engine/index.js"), i, e, {
                        wechatgame: W,
                        qqplay: P,
                        runtime: "runtime" === B || "vivo-runtime" === B || "oppo-runtime" === B || "huawei-runtime" === B,
                        nativeRenderer: L,
                        wechatgameSub: F
                    }, s, t.sourceMaps)
                }(a, H.jsCache, function () {
                    o().on("end", () => {
                        i.writeFileSync(H.jsCacheExcludes, JSON.stringify({
                            excludes: t.excludedModules,
                            version: Editor.versions.cocos2d,
                            nativeRenderer: L,
                            sourceMaps: t.sourceMaps
                        }), null, 4), s()
                    })
                })
        }), _.task("copy-webDebugger", function (s) {
            var n = e.join(V, e.basename(H.webDebuggerSrc));
            t.embedWebDebugger ? i.copy(H.webDebuggerSrc, n, s) : g(n, {
                force: !0
            }, s)
        }), _.task("revision-res-jsList", async function () {
            if (t.md5Cache) {
                console.time("revision");
                var i = await ie(e.join(H.res, "import", "**")),
                    s = await ie(e.join(H.res, "raw-assets", "**"));
                K.md5AssetsMap = {
                        import: i,
                        "raw-assets": s
                    },
                    function (t) {
                        if (t.jsList && t.jsList.length > 0) {
                            var i = H.src,
                                s = t.jsList.map(t => e.resolve(i, t)).map(t => (t = te(t).path, e.relative(i, t).replace(/\\/g, "/")));
                            s.sort(), t.jsList = s
                        }
                    }(K), console.timeEnd("revision")
            }
        }), _.task("save-settings", function (e) {
            var t = R(K, I);
            Z && (t += `(${Z.toString()})(${q});`), i.writeFile(H.settings, t, e)
        }), _.task("revision-other", function (i) {
            if (t.md5Cache) {
                var s = V,
                    n = ["index.html"];
                G && (n = n.concat(["main.js", "cocos-project-template.json", "project.json"]));
                var r = [e.relative(s, H.bundledScript)];
                W ? (n = n.concat(["game.js", "game.json", "project.config.json", "index.js"]), r = r.concat(["game.json", "project.config.json"])) : P && (n = n.concat(["main.js", "cocos2d-js.js", "cocos2d-js-min.js", "project.dev.js", "project.js", "settings.js"])), Editor.isWin32 && (r = r.map(e => e.replace(/\\/g, "/"))), _.src(["src/*.js", "*"], {
                    cwd: V,
                    base: s
                }).pipe(m.revision({
                    debug: !0,
                    hashLength: x,
                    dontRenameFile: n,
                    dontSearchFile: r,
                    annotator: function (e, t) {
                        return [{
                            contents: e,
                            path: t
                        }]
                    },
                    replacer: function (t, i, s, n) {
                        ".map" === e.extname(t.path) && n.revPathOriginal + ".map" !== t.path || (t.contents = t.contents.replace(i, "$1" + s + "$3$4"))
                    }
                })).pipe(f()).pipe(_.dest(V)).on("end", i)
            } else i()
        }), _.task("finish-build", T("copy-build-template", "import-script-statically", "before-change-files", "revision-res-jsList", "compress-settings", "save-settings", "revision-other")),
        function () {
            let t = null;
            _.task("pack-wechatgame-subdomain", function () {
                t = function () {
                    const t = Editor.require("app://editor/share/engine-extends/json-packer");
                    let s = Editor.Utils.UuidUtils.compressUuid,
                        n = o.sync(e.join(H.res, "import/**"), {
                            nodir: !0
                        }),
                        r = new t;
                    for (let t = 0; t < n.length; ++t) {
                        let o = n[t],
                            a = e.extname(o);
                        if (".json" !== a) continue;
                        let c = i.readJsonSync(o),
                            l = s(e.basename(o, a), !0);
                        r.add(l, c), g.sync(o, {
                            force: !0
                        })
                    }
                    return r.pack()
                }(), g.sync(e.join(V, "game.json"), {
                    force: !0
                }), g.sync(e.join(V, "project.config.json"), {
                    force: !0
                });
                let s = e.join(V, "game.js"),
                    n = i.readFileSync(s, "utf8"),
                    r = 'SUBCONTEXT_ROOT = "' + D + '"';
                n = n.replace(/SUBCONTEXT_ROOT = ""/g, r), i.writeFileSync(e.join(V, "index.js"), n), g.sync(s, {
                    force: !0
                });
                let a = Editor.url("packages://weapp-adapter/wechatgame/libs/sub-context-adapter.js"),
                    c = e.join(V, "libs/sub-context-adapter.js");
                i.copySync(a, c)
            }), _.task("extend-settings-wechat-subdomain", function () {
                K.packedAssets = {
                    WECHAT_SUBDOMAIN: t.indices
                }, K.WECHAT_SUBDOMAIN_DATA = JSON.parse(t.data), t = null
            })
        }(), _.task("copy-wechatgame-files", function () {
            var i = Editor.url("packages://weapp-adapter/wechatgame/libs/weapp-adapter/");
            var s = [Editor.url("packages://weapp-adapter/wechatgame/**/*"), "!" + Editor.url("packages://weapp-adapter/wechatgame/libs/sub-context-adapter.js")];
            return _.src(s).pipe(u.through(function (s) {
                var n = e.basename(s.path),
                    r = e.contains(i, s.path);
                if ("game.js" === n) {
                    var o = s.contents.toString(),
                        a = 'REMOTE_SERVER_ROOT = "' + t.wechatgame.REMOTE_SERVER_ROOT + '"';
                    o = o.replace(/REMOTE_SERVER_ROOT = ""/g, a), s.contents = new Buffer(o)
                } else if ("game.json" === n) {
                    let e = JSON.parse(s.contents.toString());
                    if (e.deviceOrientation = t.wechatgame.orientation, t.wechatgame.subContext && !F ? e.openDataContext = t.wechatgame.subContext : delete e.openDataContext, z) {
                        e.subpackages = [];
                        for (let t in z) e.subpackages.push({
                            name: t,
                            root: z[t].path
                        })
                    }
                    s.contents = new Buffer(JSON.stringify(e, null, 4))
                } else if ("project.config.json" === n) {
                    let e = JSON.parse(s.contents.toString());
                    e.appid = t.wechatgame.appid || "wx6ac3f5090a6b99c5", e.projectname = D, s.contents = new Buffer(JSON.stringify(e, null, 4))
                } else if (".js" === e.extname(n) && r) {
                    var c;
                    try {
                        c = require("babel-core").transform(s.contents.toString(), {
                            ast: !1,
                            highlightCode: !1,
                            sourceMaps: !1,
                            compact: !1,
                            filename: s.path,
                            presets: ["env"],
                            plugins: ["transform-decorators-legacy", "transform-class-properties", "transform-export-extensions", "add-module-exports"]
                        })
                    } catch (e) {
                        return e.stack = `Compile ${n} error: ${e.stack}`, this.emit("error", e)
                    }
                    s.contents = new Buffer(c.code)
                }
                this.emit("data", s)
            })).pipe(_.dest(V))
        }), _.task("copy-qqplay-files", function () {
            var e = [Editor.url("packages://qqplay-adapter/qqplay/**/*")];
            return _.src(e).pipe(u.through(function (e) {
                this.emit("data", e)
            })).pipe(_.dest(V))
        }), _.task("before-change-files", function (e) {
            let i = require(Editor.url("app://editor/share/build-utils"));
            Editor.Builder.doCustomProcess("before-change-files", i.getCommonOptions(t), Q, e)
        }), _.task(k + "web-desktop", T("build-cocos2d", ["build-common", "copy-webDebugger"], "build-web-desktop-template", "finish-build")), _.task(k + "web-mobile", T("build-cocos2d", ["build-common", "copy-webDebugger"], "build-web-mobile-template", "finish-build")), _.task(k + "fb-instant-games", T("build-cocos2d", ["build-common", "copy-webDebugger"], "build-fb-instant-games-template", "finish-build")), _.task(k + "wechatgame", T("build-cocos2d", "build-common", "copy-main-js", "copy-wechatgame-files", "finish-build")), _.task(k + "wechatgame-subcontext", T("build-cocos2d", "build-common", "copy-main-js", "copy-wechatgame-files", "pack-wechatgame-subdomain", "extend-settings-wechat-subdomain", "finish-build")), _.task(k + "qqplay", T("build-cocos2d", "build-common", "copy-main-js", "copy-qqplay-files", "finish-build")), _.task("copy-runtime-scripts", function () {
            var t = e.join(V, "src");
            return _.src(e.join(H.tmplBase, "runtime/**/*.js")).pipe(_.dest(t))
        }), _.task("encrypt-src-js", function (s) {
            if (I || !t.encryptJs) return s(), void 0;
            var n = e.join(V, "src"),
                r = e.resolve(n, "../js backups (useful for debugging)");
            i.copy(n, r, e => {
                e && Editor.warn("Failed to backup js files for debugging.", e), w.encryptJsFiles(t, s)
            })
        }), _.task("copy-jsb-adapter", function () {
            let s = Editor.url("packages://jsb-adapter/dist"),
                n = e.join(V, "jsb-adapter"),
                r = [],
                o = require(Editor.url("packages://jsb-adapter/modules.json"));
            t.excludedModules.forEach(function (t) {
                o.some(function (i) {
                    if (i.name === t && i.entries) return i.entries.forEach(function (t) {
                        r.push(e.join(Editor.url("packages://jsb-adapter"), t))
                    }), void 0
                })
            }), i.copySync(s, n, {
                filter: function (e) {
                    for (let t = 0; t < r.length; ++t)
                        if (r[t] === e) return !1;
                    return !0
                }
            })
        }), _.task("copy-native-files", T("build-common", "copy-runtime-scripts", "copy-jsb-adapter", "copy-main-js", "finish-build", "encrypt-src-js")), _.task("build-cocos-native-project", function (e) {
            w.build(t, e)
        }), _.task("build-native-project", T("build-cocos-native-project", "build-cocos2d", "copy-native-files")), _.task(k + "android", ["build-native-project"]), _.task(k + "ios", ["build-native-project"]), _.task(k + "win32", ["build-native-project"]), _.task(k + "mac", ["build-native-project"]), _.task(k + "android-instant", ["build-native-project"]);
    var se = k + $;
    if (se in _.tasks) {
        var ne;
        if (G) ne = [H.res + "/**/*", H.src + "/*/"];
        else if (W && t.wechatgame.subContext) {
            let i = "!" + e.join(V, t.wechatgame.subContext);
            ne = [e.join(V, "**/*"), i, e.join(i, "**/*")]
        } else ne = e.join(V, "**/*");
        Editor.log("Delete " + ne), g(ne, {
            force: !0
        }, e => {
            if (e) return S(e);
            _.start(se, function (e) {
                e ? S(e) : (G || Editor.Ipc.sendToMain("app:update-build-preview-path", V), S(null, Q))
            })
        })
    } else {
        var re = [];
        for (var oe in _.tasks) 0 === oe.indexOf(k) && re.push(oe.substring(k.length));
        S(new Error(s("Not support %s platform, available platform currently: %s", $, re)))
    }
}, exports.getTemplateFillPipe = O, exports.buildSettings = M;