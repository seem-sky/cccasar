(() => {
    "use strict";
    0;
    const e = require("electron").ipcRenderer;
    var t, i, r, n, o;
    window.onerror = function (e, t, i, r, n) {
        window.onerror = null;
        var o = n.stack || n;
        Editor && Editor.Ipc && Editor.Ipc.sendToMain && (Editor.Ipc.sendToMain("app:build-project-abort", o), Editor.Ipc.sendToMain("editor:renderer-console-error", o), Editor.Ipc.sendToMain("metrics:track-exception", o))
    }, window.addEventListener("unhandledrejection", function e(t) {
        window.removeEventListener("unhandledrejection", e), window.onerror(void 0, void 0, void 0, void 0, t.reason)
    }), e.on("app:init-build-worker", function (e, a, s) {
        t = require("path"), require("fire-fs"), require("gulp"), require("event-stream"), i = require("async"), r = require("lodash"), n = require("../../share/build-platforms"), Editor.isBuilder = !0, window.CC_TEST = !1, window.CC_EDITOR = !0, window.CC_PREVIEW = !1, window.CC_DEV = !1, window.CC_DEBUG = !0, window.CC_BUILD = !1, window.CC_JSB = !1, Editor.require("app://editor/share/editor-utils"), Editor.require("unpack://engine-dev"), Editor.require("app://editor/share/engine-extends/init"), Editor.require("app://editor/share/engine-extends/serialize"), Editor.require("app://editor/page/asset-db"), Editor.require("app://editor/share/register-builtin-assets");
        const d = require(Editor.url("app://editor/page/project-scripts"));
        o = Editor.remote.importPath;
        var c = !n[a].exportSimpleProject;
        i.waterfall([function (e) {
            cc.AssetLibrary.init({
                libraryPath: o
            });
            var t = document.createElement("canvas");
            document.body.appendChild(t), t.id = "engine-canvas", cc.game.run({
                width: 800,
                height: 600,
                id: "engine-canvas",
                jsList: [],
                debugMode: cc.debug.DebugMode.INFO
            }, e)
        }, Editor.Utils.asyncif(c, d.load.bind(d))], () => {
            e.reply()
        })
    }), e.on("app:build-assets", function (e, a, s, d, c) {
        var u, l, p = 4,
            f = n[s],
            w = f.pack,
            E = t.join(a, "import"),
            m = require("./file-writer"),
            h = require("./asset-crawler"),
            b = require("./build-asset"),
            g = require("./group-manager"),
            k = require("./group-strategies"),
            q = require("./texture-packer"),
            v = require("./building-assetdb"),
            x = new m(E, d),
            y = new v(Editor.assetdb),
            T = new q;
        if (f.isNative) {
            if (c.mergeStartScene = !1, c.optimizeHotUpdate) c.inlineSpriteFrames = !1;
            else {
                c.inlineSpriteFrames && Editor.info('Enable "%s" in native platform will increase the package size used in hot update.', Editor.T("BUILDER.merge_asset.inline_SpriteFrames"))
            }
            w = w && (c.optimizeHotUpdate || c.inlineSpriteFrames)
        }
        w && (l = f.isNative ? c.optimizeHotUpdate ? new k.ForHotUpdate : new k.GroupStrategyBase : new k.SizeMinimized, console.log("group strategy:", cc.js.getClassName(l)), u = new g(x, d, l, y, r.pick(c, "inlineSpriteFrames", "mergeStartScene")));
        var C, U, S, I = new b(x, o, s),
            _ = new h(I, p, T);
        var j = [function (e) {
            Editor.assetdb.queryAssets("db://assets/resources/**/*", null, e)
        }, function (e, t) {
            var i = e.filter(e => "folder" !== e.type && "javascript" !== e.type && "typescript" !== e.type).map(e => e.uuid),
                n = c.scenes;
            C = r.uniq(n.concat(i)), _.start(C, t)
        }, function (e, t) {
            U = e, t(null)
        }];
        1, j = [].concat(function (e) {
            Editor.assetdb.queryAssets("db://assets/**/*.pac", null, e)
        }, function (e, t) {
            T.init({
                files: e,
                writer: x,
                platform: s
            }).then(t).catch(t)
        }, j, function (e) {
            Editor.Ipc.sendToMain("builder:state-changed", "pack-textures", .7), console.time("pack textures"), T.pack().then(t => {
                let {
                    unpackedTextures: i,
                    packedSpriteFrames: n,
                    packedTextures: o
                } = t;
                for (let e in n) U[e] = {
                    dependUuids: [n[e]]
                };
                for (let e in o) {
                    let t = o[e];
                    U[e] = {
                        nativePath: t
                    }, y.addGeneratedAsset(e, t, "texture", !1)
                }
                let a = [],
                    s = T.textureUuids,
                    d = T.texture2pac;
                for (let e in U) {
                    let t = U[e];
                    if ("object" != typeof t) continue;
                    let i = t.dependUuids;
                    if (i)
                        for (let t = 0, r = i.length; t < r; t++) {
                            let r = i[t];
                            if (-1 !== s.indexOf(r) && -1 === a.indexOf(r)) {
                                a.push(r);
                                let t = Editor.assetdb.remote.uuidToUrl(r),
                                    i = d[r].relativePath,
                                    n = Editor.assetdb.remote.uuidToUrl(e);
                                Editor.warn(Editor.T("BUILDER.error.keep_raw_texture_of_atlas", {
                                    texturePath: t,
                                    pacPath: i,
                                    assetPath: n
                                }))
                            }
                        }
                }
                if (r.pullAll(C, s), i.length > 0 || a.length > 0) {
                    let t = i.map(e => {
                        let t = Editor.assetdb.remote.uuidToUrl(e.textureUuid);
                        return Editor.warn(`${t} has not been packed into AutoAtlas, please check it.`), e.uuid
                    }).concat(a);
                    new h(I, p).start(t, (t, i) => {
                        if (t) return e(t);
                        Object.assign(U, i), e()
                    }), C = r.uniq(C.concat(t))
                } else e();
                console.timeEnd("pack textures"), w ? Editor.Ipc.sendToMain("builder:state-changed", "pack-assets", .8) : Editor.Ipc.sendToMain("builder:state-changed", "build-assets", .8)
            }).catch(t => e(t))
        }), w && j.push(function (e) {
            console.time("init packs"), u.initPacks(C, U, c.scenes[0], e)
        }, function (e) {
            console.timeEnd("init packs"), console.time("build packs"), u.buildPacks(e)
        }, function (e, t) {
            console.timeEnd("build packs"), S = e.packedAssets, t()
        }), j.push(function (e) {
            x.flush(e)
        }), i.waterfall(j, function (t) {
            if (t)(t = t && t.stack) instanceof Error || (t = new Error(t)), e.reply(t);
            else {
                console.log("finished build-worker");
                e.reply(null, U, S)
            }
        })
    })
})();