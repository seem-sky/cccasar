"use strict";
const e = require("fire-fs"),
    t = require("fire-path"),
    r = require("electron"),
    a = require("node-uuid"),
    i = require(Editor.url("packages://builder/utils/event")),
    o = require(Editor.url("app://editor/share/build-utils")),
    s = require(Editor.url("packages://builder/panel/platform/android")),
    l = require(Editor.url("packages://builder/panel/platform/web-desktop")),
    d = require(Editor.url("packages://builder/panel/platform/web-mobile")),
    n = require(Editor.url("packages://builder/panel/platform/fb-instant-games")),
    u = require(Editor.url("packages://builder/panel/platform/android-instant")),
    c = require(Editor.url("packages://builder/panel/platform/wechatgame")),
    p = require(Editor.url("packages://builder/panel/platform/wechatgame-subcontext")),
    h = require(Editor.url("packages://builder/panel/platform/qqplay")),
    m = require(Editor.url("packages://builder/panel/platform/windows")),
    f = require(Editor.url("packages://builder/panel/platform/ios")),
    E = require(Editor.url("packages://builder/panel/platform/mac")),
    b = require("electron").remote.dialog,
    v = {
        data: null,
        project: null,
        anysdk: null
    };
var g = function (e, t, r) {
    return t = t || {}, Object.keys(e).forEach(a => {
        if (!r || -1 === r.indexOf(a)) {
            var i = e[a];
            "object" != typeof i || Array.isArray(i) ? t[a] = i : t[a] = g(i)
        }
    }), t
};
Editor.Panel.extend({
    style: e.readFileSync(Editor.url("packages://builder/panel/builder.css")),
    template: e.readFileSync(Editor.url("packages://builder/panel/builder.html")),
    messages: {
        "builder:state-changed": function (e, t, r) {
            if (this._vm) {
                if (r *= 100, "error" === t) return this._vm.buildProgress = r, this._vm.buildState = "failed", this._vm.task = "", void 0;
                if ("finish" === t) return this._vm.buildProgress = 100, this._vm.buildState = "completed", this._vm.task = "", void 0;
                this._vm.buildProgress = r, this._vm.buildState = t
            }
        },
        "builder:events": function (e, t, ...r) {
            i.emit(t, ...r)
        },
        "keystore:created": function (e, t) {
            this._vm.data.keystorePath = t.path, this._vm.data.keystorePassword = t.password, this._vm.data.keystoreAlias = t.alias, this._vm.data.keystoreAliasPassword = t.aliasPassword
        },
        "asset-db:assets-deleted": function (e, t) {
            this._vm.scenes = this._vm.scenes.filter(e => t.find(t => t.uuid !== e.value))
        },
        "asset-db:assets-moved": function (e, t) {
            t.forEach(e => {
                let t = this._vm.scenes.find(t => t.value === e.uuid);
                t && (t.text = e.url, t.checked = !t.checked, setTimeout(() => {
                    t.checked = !t.checked
                }, 0))
            })
        },
        "asset-db:assets-created": function (e, t) {
            t.forEach(e => {
                "scene" === e.type && this._vm.scenes.push({
                    value: e.uuid,
                    text: e.url,
                    checked: !0
                })
            })
        }
    },
    ready() {
        var i = this.profiles.local,
            _ = this.profiles.project,
            k = g(i.data, {}),
            x = g(_.data, {});
        k.actualPlatform = k.actualPlatform || k.platform;
        let P = {},
            B = [d, s, u, l, n, c, p, h, m, f, E],
            I = Editor.remote.Builder.simpleBuildTargets;
        for (let e in I) {
            let t = I[e];
            if (t.settings) {
                let e = require(t.settings);
                !e.name && (e.name = t.platform), B.push(e)
            } else Editor.warn("Can not load package", t.name)
        }
        B.forEach(e => {
            e.props || (e.props = {});
            for (let t in v) !e.props[t] && (e.props[t] = v[t]);
            P[e.name] = e
        });
        var w = this._vm = new window.Vue({
            el: this.shadowRoot,
            data: {
                platforms: function (e) {
                    var t = [];
                    t.push({
                        value: "web-mobile",
                        text: "Web Mobile"
                    }), t.push({
                        value: "web-desktop",
                        text: "Web Desktop"
                    }), t.push({
                        value: "fb-instant-games",
                        text: "Facebook Instant Games"
                    }), t.push({
                        value: "wechatgame",
                        text: "Wechat Game"
                    }), t.push({
                        value: "wechatgame-subcontext",
                        text: "Wechat Game Open Data Context"
                    }), t.push({
                        value: "qqplay",
                        text: "QQ Play"
                    }), t.push({
                        value: "android",
                        text: "Android"
                    }), t.push({
                        value: "android-instant",
                        text: "Android Instant"
                    }), "darwin" === process.platform && (t.push({
                        value: "ios",
                        text: "iOS"
                    }), t.push({
                        value: "mac",
                        text: "Mac"
                    })), "win32" === process.platform && t.push({
                        value: "win32",
                        text: "Windows"
                    });
                    var r = Editor.remote.Builder.simpleBuildTargets;
                    let a = [];
                    for (var i in r) {
                        let e = r[i];
                        e.settings && a.push({
                            value: e.platform,
                            text: e.name
                        })
                    }
                    return a.sort(e => -1 != e.text.toLowerCase().indexOf("oppo") ? -1 : 1), t = t.concat(a)
                }(),
                scenes: [],
                all: !1,
                task: "",
                record: "",
                data: k,
                project: x,
                buildState: "idle",
                buildProgress: 0,
                anysdk: "zh" === Editor.lang
            },
            computed: {
                actualPlatform: {
                    get() {
                        return this.data.actualPlatform
                    },
                    set(e) {
                        var t = Editor.remote.Builder.simpleBuildTargets[e];
                        this.data.platform = t && t.extends || e, this.data.actualPlatform = e
                    }
                },
                needCompile() {
                    var e = Editor.remote.Builder,
                        t = e.simpleBuildTargets[this.data.actualPlatform];
                    if (t && t.buttons) return t.buttons.includes(e.DefaultButtons.Compile);
                    return Editor.require("app://editor/share/build-platforms")[this.data.platform].isNative
                }
            },
            watch: {
                data: {
                    handler(e) {
                        i.save && (g(e, i.data), i.save())
                    },
                    deep: !0
                },
                project: {
                    handler(e) {
                        _.save && (g(e, _.data), _.save())
                    },
                    deep: !0
                },
                scenes: {
                    handler(e) {
                        var t = this.project.startScene;
                        for (let a = 0; a < e.length; a++) {
                            let i = e[a];
                            if (!i.text.startsWith("db://assets/resources/") && t !== i.value) {
                                var r = this.project.excludeScenes.indexOf(i.value);
                                i.checked || -1 !== r ? i.checked && -1 !== r && this.project.excludeScenes.splice(r, 1) : this.project.excludeScenes.push(i.value)
                            }
                        }
                        this.all = this.scenes.every(function (e) {
                            return e.checked
                        })
                    },
                    deep: !0
                }
            },
            components: P,
            methods: {
                t: e => Editor.T(e),
                _onOpenCompileLogFile(e) {
                    e.stopPropagation(), Editor.Ipc.sendToMain("app:open-cocos-console-log")
                },
                _onChooseDistPathClick(e) {
                    e.stopPropagation();
                    let r = Editor.Dialog.openFile({
                        defaultPath: o.getAbsoluteBuildPath(k.buildPath),
                        properties: ["openDirectory"]
                    });
                    r && r[0] && (t.contains(Editor.Project.path, r[0]) ? (this.data.buildPath = t.relative(Editor.Project.path, r[0]).replace(/\\/g, "/"), "" === this.data.buildPath && (this.data.buildPath = "./")) : this.data.buildPath = r[0])
                },
                _getAPILevel(e) {
                    let t = e.match("android-([0-9]+)$"),
                        r = -1;
                    return t && (r = parseInt(t[1])), r
                },
                _onShowInFinderClick(t) {
                    t.stopPropagation();
                    let a = o.getAbsoluteBuildPath(k.buildPath);
                    if (!e.existsSync(a)) return Editor.warn("%s not exists!", a), void 0;
                    r.shell.showItemInFolder(a), r.shell.beep()
                },
                _onSelectAllCheckedChanged(e) {
                    if (!this.scenes) return;
                    let t = this.project.startScene;
                    for (let a = 0; a < this.scenes.length; a++) {
                        let i = this.scenes[a];
                        if (!i.text.startsWith("db://assets/resources/") && t !== i.value) {
                            i.checked = e.detail.value;
                            var r = this.project.excludeScenes.indexOf(i.value);
                            i.checked || -1 !== r ? i.checked && -1 !== r && this.project.excludeScenes.splice(r, 1) : this.project.excludeScenes.push(i.value)
                        }
                    }
                },
                startTask(e, t) {
                    this.task = e, Editor.Profile.load("profile://project/project.json", (r, a) => {
                        t.excludedModules = a.data["excluded-modules"], Editor.Ipc.sendToMain("builder:start-task", e, t)
                    })
                },
                _onBuildClick(e) {
                    e.stopPropagation(), Editor.Ipc.sendToPanel("scene", "scene:query-dirty-state", (e, t) => {
                        if (t.dirty) return Editor.error(t.name + " " + Editor.T("BUILDER.error.dirty_info")), void 0;
                        this._build()
                    })
                },
                _build() {
                    var r = o.getAbsoluteBuildPath(k.buildPath),
                        a = t.win32.dirname(r),
                        s = k.platform;
                    let l = Editor.require("app://editor/share/build-platforms")[s].isNative;
                    if (Editor.isWin32 && l && r.length > 58) return b.showErrorBox(Editor.T("BUILDER.error.path_too_long_title"), Editor.T("BUILDER.error.path_too_long_desc", {
                        max_length: 58
                    })), void 0;
                    if (!e.existsSync(a)) return b.showErrorBox(Editor.T("BUILDER.error.build_error"), Editor.T("BUILDER.error.build_dir_not_exists", {
                        buildDir: a
                    })), void 0;
                    var d = this._getAPILevel(k.apiLevel);
                    if ("android" === s && "binary" === k.template && d < 22) return b.showErrorBox(Editor.T("BUILDER.error.build_error"), Editor.T("BUILDER.error.binary_api_level")), void 0;
                    if (-1 !== r.indexOf(" ")) return b.showErrorBox(Editor.T("BUILDER.error.build_error"), Editor.T("BUILDER.error.build_path_contains_space")), void 0;
                    let n = _.data["android-instant"].recordPath || "";
                    if (n = n.trim(), !("android-instant" !== s || this.project["android-instant"].skipRecord || n && e.existsSync(t.join(n, "packageInfo.json")))) return b.showErrorBox(Editor.T("BUILDER.error.build_error"), Editor.T("BUILDER.error.refactor_info_not_found")), void 0;
                    if (/.*[\u4e00-\u9fa5]+.*$/.test(r)) return b.showErrorBox(Editor.T("BUILDER.error.build_error"), Editor.T("BUILDER.error.build_path_contains_chinese")), void 0;
                    if (!("android" === s, /^[a-zA-Z0-9_-]*$/).test(this.project.title)) return b.showErrorBox(Editor.T("BUILDER.error.build_error"), Editor.T("BUILDER.error.project_name_not_legal")), void 0;
                    let u = this.project.packageName;
                    if ("ios" === s || "android" === s || "mac" === s) {
                        if (!("android" === s ? /^[a-zA-Z0-9_.]*$/ : /^[a-zA-Z0-9_.-]*$/).test(u)) return b.showErrorBox(Editor.T("BUILDER.error.build_error"), Editor.T("BUILDER.error.package_name_not_legal")), void 0;
                        let e = u.split(".");
                        for (let t = 0; t < e.length; t++)
                            if (!isNaN(e[t][0])) return b.showErrorBox(Editor.T("BUILDER.error.build_error"), Editor.T("BUILDER.error.package_name_start_with_number")), void 0
                    }
                    let c = o.getOptions(_, i);
                    if ("android" === s || "android-instant" === s) {
                        if (c.appABIs.find(e => {
                                if ("arm64-v8a" === e) return e
                            }) && parseInt(c.apiLevel.split("-")[1]) < 21) return b.showErrorBox(Editor.T("BUILDER.error.build_error"), Editor.T("BUILDER.error.arm64_not_support", {
                            current_api: c.apiLevel,
                            min_version: 21
                        })), void 0
                    }
                    Editor.Ipc.sendToAll("builder:state-changed", "ready", 0);
                    var p = this.scenes.filter(function (e) {
                        return e.checked
                    }).map(function (e) {
                        return e.value
                    });
                    if (p.length > 0) {
                        c.actualPlatform = this.data.actualPlatform, c.scenes = p;
                        let e = c.platform;
                        e && (l && "android-instant" !== e && (c.inlineSpriteFrames = c.inlineSpriteFrames_native), c.embedWebDebugger = ("web-mobile" === e || "fb-instant-games" === e) && c.embedWebDebugger), this.startTask("build", c), Editor.Ipc.sendToMain("metrics:track-event", {
                            category: "Project",
                            action: "Build",
                            label: e
                        })
                    } else b.showErrorBox(Editor.T("BUILDER.error.build_error"), Editor.T("BUILDER.error.select_scenes_to_build"))
                },
                _onCompileClick(e) {
                    e.stopPropagation(), this.startTask("compile", o.getOptions(_, i))
                },
                _onStopCompileClick: function (e) {
                    e.stopPropagation(), Editor.Ipc.sendToMain("app:stop-compile")
                },
                _onPreviewClick(r) {
                    if (r.stopPropagation(), "android-instant" === k.platform && !e.existsSync(t.join(Editor.globalProfile.data["android-sdk-root"], "extras/google/instantapps/ia"))) return b.showErrorBox(Editor.T("BUILDER.error.build_error"), Editor.T("BUILDER.error.instant_utils_not_found")), void 0;
                    var a = o.getOptions(_, i),
                        s = Editor.remote.Builder.simpleBuildTargets[this.data.actualPlatform];
                    if (s && s.buttons) {
                        var l = s.buttons[1].message;
                        Editor.Ipc.sendToMain(`${s.package}:${l}`, a)
                    } else Editor.Ipc.sendToMain("app:run-project", a)
                },
                _openExternal(e, t) {
                    e.stopPropagation(), r.shell.openExternal(t)
                },
                _onRecordClick(e) {
                    let r = function (e) {
                            return ["FullYear", "Month", "Date", "Hours", "Minutes", "Seconds"].map(t => {
                                let r = e[`get${t}`]();
                                return "Month" === t && r++, r < 10 && (r = "0" + r), r
                            }).join("")
                        }(new Date),
                        a = t.join(Editor.Project.path, `/temp/android-instant-games/profiles/${r}`);
                    Editor.Ipc.sendToMain("app:play-on-device", {
                        platform: "simulator",
                        recordPath: a
                    })
                },
                _onRefactorClick(e) {
                    Editor.Panel.open("google-instant-games")
                }
            }
        });
        w.project.title || (w.project.title = Editor.Project.name), w.project.xxteaKey || (w.project.xxteaKey = a.v4().substr(0, 16)), w.project.packageName || (w.project.packageName = "org.cocos2d." + w.project.title), w.data.buildPath || (w.data.buildPath = "./build"), Editor.Ipc.sendToMain("builder:query-current-state", (e, t) => {
            if (e) return Editor.warn(e);
            w.task = t.task, Editor.Ipc.sendToAll("builder:state-changed", t.state, t.progress)
        }), Editor.assetdb.queryAssets(null, "scene", function (e, t) {
            var r = !1;
            r = r || function (e, t) {
                    for (var r = !1, a = 0; a < e.length; a++) {
                        let i = e[a];
                        t.some(e => e.uuid === i) || (r = !0, e.splice(a--, 1))
                    }
                    return r
                }(w.project.excludeScenes, t),
                function (e, t, r) {
                    t.forEach(t => {
                        e.push({
                            value: t.uuid,
                            text: t.url,
                            checked: -1 === r.indexOf(t.uuid)
                        })
                    })
                }(w.scenes, t, w.project.excludeScenes),
                function (e, t) {
                    var r = e.startScene;
                    let a = !!t.find(function (e) {
                        return e.value === r
                    });
                    r && a || (t.length > 0 ? e.startScene = t[0].value : e.startScene = "")
                }(w.project, w.scenes), r && w.project.save()
        })
    }
});