const e = require("fire-fs"),
    t = require("events"),
    r = require("async"),
    i = require("winston"),
    {
        promisify: o
    } = require("util");
require("fire-path");
const s = require("../../core/gulp-build"),
    a = require(Editor.url("app://editor/share/build-utils")),
    l = require("../../share/build-platforms");
var n = Object.assign(new t, {
    DefaultButtons: {
        Build: 1,
        Compile: 2,
        Play: 3
    },
    doCustomProcess(e, t, r, i) {
        console.log(`Builder: do custom process [${e}]`), (t = Object.assign({}, t)).buildResults = r, (async () => {
            var r = this.simpleBuildTargets[t.actualPlatform];
            r && r.messages[e] && await new Promise((i, o) => {
                Editor.Ipc.sendToMain(`${r.package}:${e}`, t, e => {
                    e ? o(e) : i()
                }, -1)
            });
            var i = n.listeners(e);
            if (i)
                for (var s = 0; s < i.length; ++s) {
                    let e = i[s];
                    await o(e)(t)
                }
        })().then(i, e => {
            Editor.error(e), i(e)
        })
    },
    _getOptionsFromCommand(t) {
        let r = Editor.Profile.load("profile://local/builder.json"),
            i = Editor.Profile.load("profile://project/builder.json"),
            o = a.getOptions(i, r),
            s = Editor.Profile.load("profile://project/project.json").data;
        Object.assign(o, {
            excludedModules: s["excluded-modules"],
            autoCompile: !1
        });
        let l = {};
        if ("string" == typeof t) {
            let e = t.split(";");
            for (let t = 0, r = e.length; t < r; t++) {
                let r = e[t].split("=");
                if (!r[1]) continue;
                let i = r[0];
                if ("boolean" == typeof o[i]) try {
                    r[1] = JSON.parse(r[1])
                } catch (e) {
                    Editor.error(e)
                } else if ("number" == typeof o[i]) try {
                    r[1] = Number.parseFloat(r[1])
                } catch (e) {
                    Editor.error(e)
                } else if (Array.isArray(o[i])) {
                    let e = `{"value": ${r[1]}}`.replace(/'/g, '"');
                    try {
                        let t = JSON.parse(e);
                        r[1] = t.value
                    } catch (e) {
                        Editor.error(e)
                    }
                } else if ("object" == typeof o[i]) {
                    let e = r[1].replace(/'/g, '"');
                    try {
                        let t = JSON.parse(e);
                        r[1] = Object.assign({}, o[i], t)
                    } catch (e) {
                        Editor.error(e)
                    }
                }
                l[i] = r[1]
            }
        }
        let n = l.configPath,
            d = {};
        if (n && e.existsSync(n)) try {
            d = JSON.parse(e.readFileSync(n, "utf8"))
        } catch (e) {
            Editor.error(`Parse ${n} failed. ` + e)
        }
        const c = Editor.require("app://editor/share/build-platforms");
        let u = l.platform || d.platform || o.platform;
        if (u) {
            c[u].isNative && (o.inlineSpriteFrames = o.inlineSpriteFrames_native)
        }
        let p = Object.assign({}, o, d, l);
        return p.buildPath ? (a.updateOptions(p), {
            options: p
        }) : {
            error: new Error("Please specify the [buildPath] option")
        }
    },
    _registerCommandProgressBar() {
        const e = require("electron");
        var t = new(require("progress"))("[  :state [:bar] :percent :etas  ]", {
            incomplete: " ",
            width: 40,
            total: 100
        });
        let r = 0;
        e.ipcMain.on("builder:state-changed", (e, i, o) => {
            t.tick(100 * (o - r), {
                state: i
            }), r = o
        })
    },
    build: function (e, t) {
        Editor.Ipc.sendToMain("builder:state-changed", "start", 0);
        var o = e.scenes,
            l = o.indexOf(e.startScene);
        if (-1 === l) return Editor.error("Failed to find start scene in scene list."), void 0;
        if (0 !== l) {
            var d = o[0];
            o[0] = o[l], o[l] = d
        }
        var c = Object.assign({}, e, {
            project: Editor.Project.path,
            projectName: e.title,
            scenes: o,
            debugBuildWorker: n.debugWorker
        });
        i.normal(`Start building with options : ${JSON.stringify(a.getCommonOptions(c),null,2)}`), r.waterfall([e => {
            n.doCustomProcess("build-start", a.getCommonOptions(c), null, e)
        }, e => {
            s.startWithArgs(c, e)
        }, (e, t) => {
            Editor.Ipc.sendToMain("builder:state-changed", "custom-build-process", .99), n.doCustomProcess("build-finished", a.getCommonOptions(c), e, t)
        }], r => {
            r ? (Editor.error("Build Failed: %s", r.stack || r), Editor.Ipc.sendToMain("builder:state-changed", "error", 1, r)) : (Editor.log('Built to "' + e.dest + '" successfully'), Editor.Ipc.sendToMain("builder:state-changed", "finish", 1), e.includeSDKBox && Editor.Ipc.sendToMain("sdkbox:import-query", e)), t && t(r)
        })
    },
    buildCommand: function (e, t) {
        let i = this._getOptionsFromCommand(e);
        if (i.error) return t(i.error);
        let o = i.options;
        this._registerCommandProgressBar(), Editor.assetdb.queryAssets(null, "scene", (e, i) => {
            let s = Editor.Profile.load("profile://project/builder.json");
            i = (i = i.filter(e => -1 === s.data.excludeScenes.indexOf(e.uuid))).map(e => e.uuid), o.scenes = i;
            let a = !!i.find(function (e) {
                return e === o.startScene
            });
            o.startScene && a || (i.length > 0 ? o.startScene = i[0] : o.startScene = ""), r.series([e => {
                console.log(`Start to build platform [${o.platform}]`), this.build(o, e)
            }, e => {
                let t = l[o.platform];
                if (!1 === o.autoCompile || !t.isNative || !t.useTemplate) return e();
                console.log(`Start to compile platform [${o.platform}]`), Editor.Ipc.sendToMain("builder:state-changed", "start", 0), Editor.NativeUtils.compile(o, function (t) {
                    if (t) return Editor.Ipc.sendToMain("builder:state-changed", "error", 1), e(t);
                    Editor.Ipc.sendToMain("builder:state-changed", "finish", 1), e()
                })
            }], e => {
                t(e)
            })
        })
    },
    compile(e, t) {
        let i = e.platform;
        if ("ios" === i || "android" === i || "mac" === i || "win32" === i || "android-instant" === i) return Editor.Ipc.sendToMain("builder:state-changed", "start", 0), r.series([t => {
            Editor.NativeUtils.compile(e, t)
        }, t => {
            Editor.Ipc.sendToMain("builder:state-changed", "custom-compile-process", .99), n.doCustomProcess("compile-finished", a.getCommonOptions(e), null, t)
        }], e => {
            if (e) return Editor.Ipc.sendToMain("builder:state-changed", "error", 1), Editor.failed(e), t && t(e), void 0;
            t && t(), Editor.Ipc.sendToMain("builder:state-changed", "finish", 1)
        }), void 0;
        t && t(new Error(`Not support compile platform [${i}]`))
    },
    compileCommand(e, t) {
        let r = this._getOptionsFromCommand(e);
        if (r.error) return t(r.error);
        let o = r.options;
        i.normal(`Start compiling with options : ${JSON.stringify(a.getCommonOptions(o),null,2)}`), this._registerCommandProgressBar(), this.compile(o, t)
    },
    debugWorker: !1,
    buildTemplates: Object.create(null),
    simpleBuildTargets: Object.create(null)
});
require("../../core/builder-anysdk").init(n), module.exports = n;