"use strict";
const e = require("iconv-lite"),
    t = require("fire-path"),
    r = require("fire-fs"),
    i = require("del"),
    n = require("child_process").spawn,
    o = require("tree-kill"),
    a = require("async"),
    s = require("electron"),
    l = require("globby"),
    c = require("xxtea-node"),
    d = require("zlib"),
    p = Editor.require("app://share/engine-utils");
let u = t.join(Editor.App.home, "logs/native.log"),
    f = Editor.App._profile.data["show-console-log"];
let E, m, g, y, S, j, h, w, v, _, O, P, C, A, R, b, x, k, $ = -1,
    I = -1,
    F = "",
    T = Editor.url("unpack://utils/Python27/python");

function L() {
    let e = Editor.Profile.load("profile://local/settings.json"),
        t = e.data;
    return !1 !== e.data["use-global-engine-setting"] && (t = Editor.Profile.load("profile://global/settings.json").data), t["use-default-cpp-engine"] ? Editor.builtinCocosRoot : t["cpp-engine-path"]
}

function D(e, r) {
    var i;
    let o = N();
    if (o) return [o, i];
    e = [y].concat(e);
    try {
        if ("darwin" === process.platform) i = n("sh", e, r);
        else {
            let o = e.indexOf("--env"),
                a = "COCOS_PYTHON_HOME=" + t.dirname(T);
            o >= 0 ? o === e.length - 1 ? e.push(a) : e[o + 1] += ";" + a : (e.push("--env"), e.push(a)), i = n(T, e, r)
        }
    } catch (e) {
        o = e
    }
    return {
        error: o,
        child: i
    }
}

function N() {
    return g = L(), console.log("Cocos2dx root: " + g), -1 !== g.indexOf(" ") ? new Error(`Cocos2dx root [${g}] can't include space.`) : (m = t.join(g, "tools/cocos2d-console/bin"), y = "darwin" === process.platform ? t.join(m, "cocos") : t.join(m, "cocos.py"), null)
}

function M(e, i) {
    if (h = e.platform, !(C = e.template)) return i && i(new Error("Template is empty, please select a template.")), void 0;
    w = e.buildPath, v = e.dest, _ = e.projectName || e.title || t.basename(e.project), O = e.packageName || "com.fireball." + _, P = e.debug, A = e.useDebugKeystore, R = A ? Editor.url("unpack://static/build-templates/native/debug.keystore") : e.keystorePath, "win32" === process.platform && (R = R.replace(/\\/g, "/")), b = A ? 123456 : e.keystorePassword, x = A ? "debug_keystore" : e.keystoreAlias, k = A ? 123456 : e.keystoreAliasPassword;
    let o = function (e) {
        e = e || {};
        let i = Editor.App._profile.data;
        f = i["show-console-log"];
        let n = N();
        if (n) return n;
        let o = e.ndkRoot || i["ndk-root"],
            a = e.androidSDKRoot || i["android-sdk-root"];
        S = {
            COCOS_FRAMEWORKS: t.join(g, "../"),
            COCOS_X_ROOT: g,
            COCOS_CONSOLE_ROOT: m,
            NDK_ROOT: o,
            ANDROID_SDK_ROOT: a
        }, j = "";
        for (let e in S) "" !== j && (j += ";"), j += `${e}=${S[e]}`;

        function s(e, t) {
            return t ? r.existsSync(t) ? null : new Error(`Can't find [${e}] path: ${t}`) : new Error(`[${e}] is empty, please set [${e}] in Preferences.`)
        }
        if (console.log(`native environment string : ${j}`), n = s("Cocos Console Root", m)) return n;
        if (!r.existsSync(y)) return new Error(`Can't find Cocos Console Bin: ${y}`);
        if ("android" === h || "android-instant" === h) {
            if (n = s("NDK Root", o)) return n;
            if (n = s("Android SDK Root", a)) return n;
            if (!("win32" !== process.platform || process.env.JAVA_HOME && r.existsSync(process.env.JAVA_HOME))) return new Error("Please make sure java is installed and JAVA_HOME is in your environment")
        }
        return null
    }(e);
    return o ? (i && i(o), void 0) : (o = function () {
        if (-1 === h.indexOf("android") || A) return null;
        if (!R) return new Error("Keystore Path is empty, please set Keystore path");
        if (!r.existsSync(R)) return new Error(`Keystore Path [${R}] is not exists, please check Keystore path`);
        if (!b) return new Error("Keystore Password is empty, please set Keystore Password");
        if (!x) return new Error("Keystore Alias is empty, please set Keystore Alias");
        if (!k) return new Error("Keystore Alias Password is empty, please set Keystore Alias Password");
        return null
    }()) ? (i && i(o), void 0) : (a.series([e => {
        if ("win32" === process.platform) return e(), void 0;
        try {
            let t, r = n("python", ["-V"]);
            r.stderr.on("data", function (e) {
                let t = e.toString();
                "3" === (t = t.replace("Python ", "").replace("\n", ""))[0] ? Editor.warn(`Checked Python Version [${t}], please use python 2.x.x version. Recommend [2.7.5] version`): Editor.log(`Checked Python Version [${t}]`)
            }), r.on("error", function () {
                t = new Error("Can't find python, please install python or check your environment")
            }), r.on("close", function () {
                e(t)
            })
        } catch (t) {
            e(new Error("Can't find python, please install python or check your environment"))
        }
    }, e => {
        let t = D(["-v"]);
        if (t.error) return e(t.error);
        let r = t.child;
        r.stdout.on("data", function (e) {
            E = e.toString()
        }), r.stderr.on("data", function (e) {
            Editor.failed(e.toString())
        }), r.on("close", function () {
            e()
        }), r.on("error", function (t) {
            e(t)
        })
    }, e => {
        let i = t.join(m, "../../../"),
            n = t.join(i, "version"),
            o = t.join(i, "cocos/cocos2d.cpp"),
            a = t.join(i, "frameworks/js-bindings/bindings/manual/ScriptingCore.h");
        if (r.existsSync(n)) F = r.readFileSync(n, "utf8");
        else {
            let e = null,
                t = null;
            if (r.existsSync(o) ? (e = o, t = '.*return[ \t]+"(.*)";') : r.existsSync(a) && (e = a, t = '.*#define[ \t]+ENGINE_VERSION[ \t]+"(.*)"'), e) {
                let i = r.readFileSync(e, "utf8").match(t);
                i && (F = i[1])
            }
        }
        if (F) {
            let e = F.match("([0-9]+)[.]([0-9]+)");
            e && ($ = parseInt(e[1]), I = parseInt(e[2]))
        }
        e()
    }], e => {
        i && i(e)
    }), void 0)
}

function K(e, i) {
    let n = require("ini"),
        o = t.join(e, "cocos2d.ini");
    if (!r.existsSync(o)) return Editor.failed(`Can't find ${o}`), null;
    let a = n.parse(r.readFileSync(o, "utf-8"));
    a.paths.templates || (a.paths.templates = "../../../templates"), a.engineMode = a.global.cocos2d_x_mode, a.templatesPath = t.join(e, a.paths.templates);
    let s = t.join(a.templatesPath, "js-template-*");
    a.templates = [], l(s, (e, r) => {
        r.forEach(e => {
            e = t.normalize(e);
            let r = t.basename(e);
            r = r.replace("js-template-", ""), a.templates.push(r)
        }), i && i(a)
    })
}
const U = 16;
const V = 26;

function B(e) {
    let t = "utf-8",
        i = r.readFileSync(Editor.url("unpack://utils/locale-encoding.py"));
    try {
        let r;
        try {
            r = "darwin" === process.platform ? n("python", ["-c", i]) : n(T, ["-c", i])
        } catch (t) {
            return e && e(t), void 0
        }
        r.stdout.on("data", function (e) {
            let r = e.toString();
            r && (t = r)
        }), r.stderr.on("data", function (e) {
            Editor.failed(e.toString())
        }), r.on("close", function () {
            e && e(null, t)
        }), r.on("error", function (t) {
            e && e(t)
        })
    } catch (r) {
        Editor.log("Get locale encoding failed, use utf-8 encoding"), e && e(null, t)
    }
}

function J(t, i, n) {
    let o = "utf-8",
        a = {
            logFilePath: u,
            disableEditorLog: !f,
            useSystemEncoding: !0,
            prefix: ""
        };

    function s() {
        let a;
        i.logFilePath && (r.ensureFileSync(i.logFilePath), a = r.createWriteStream(i.logFilePath, {
            defaultEncoding: o
        })), t.stdout.on("data", t => {
            if (a && a.write(t), i.disableEditorLog) return;
            let r;
            (r = "win32" === process.platform ? e.decode(t, o) : t.toString()).length > 1 && (r = r.replace(/\n*$/g, "")), r.split("\n").forEach(e => {
                i.prefix && (e = i.prefix + " : " + e), Editor.log(e)
            })
        }), t.stderr.on("data", t => {
            if (a && a.write(t), i.disableEditorLog) return;
            let r;
            r = "win32" === process.platform ? e.decode(t, o) : t.toString(), i.prefix && (r = i.prefix + " : " + r), -1 !== r.indexOf("warning") ? Editor.warn(r) : Editor.failed(r)
        }), t.on("close", (e, r) => {
            a && a.close(), n.call(t, null, e, r)
        }), t.on("error", function (e) {
            n.call(t, e)
        })
    }
    if ("function" == typeof i ? (n = i, i = a) : i = Object.assign(a, i), i.useSystemEncoding) return B((e, t) => {
        o = t, s()
    }), void 0;
    s()
}

function q() {
    if ("binary" !== C) return null;
    let e = t.join(g, "prebuilt", h);
    return r.existsSync(e) ? null : new Error(`Can't find prebuilt libs for platform [${h}]. Please compile prebuilt libs first`)
}

function H(e) {
    if (-1 === h.indexOf("android")) return;
    A && (R = Editor.url("unpack://static/build-templates/native/debug.keystore")), "win32" === process.platform && (R = R.replace(/\\/g, "/"));
    let i = t.join(v, "frameworks/runtime-src/proj.android-studio/gradle.properties");
    if (r.existsSync(i)) {
        let n = r.readFileSync(i, "utf-8");
        n = (n = (n = (n = (n = (n = n.replace(/RELEASE_STORE_FILE=.*/, `RELEASE_STORE_FILE=${R}`)).replace(/RELEASE_STORE_PASSWORD=.*/, `RELEASE_STORE_PASSWORD=${b}`)).replace(/RELEASE_KEY_ALIAS=.*/, `RELEASE_KEY_ALIAS=${x}`)).replace(/RELEASE_KEY_PASSWORD=.*/, `RELEASE_KEY_PASSWORD=${k}`)).replace(/PROP_TARGET_SDK_VERSION=.*/, `PROP_TARGET_SDK_VERSION=${Y(e.apiLevel)}`)).replace(/PROP_COMPILE_SDK_VERSION=.*/, `PROP_COMPILE_SDK_VERSION=${Y(e.apiLevel)}`);
        let o = e.appABIs && e.appABIs.length > 0 ? e.appABIs.join(":") : "armeabi-v7a";
        n = n.replace(/PROP_APP_ABI=.*/g, `PROP_APP_ABI=${o}`), r.writeFileSync(i, n), n = "", n += `ndk.dir=${S.NDK_ROOT}\n`, n += `sdk.dir=${S.ANDROID_SDK_ROOT}`, r.writeFileSync(t.join(t.dirname(i), "local.properties"), n)
    }
}

function z() {
    try {
        i.sync(t.join(v, "res"), {
            force: !0
        }), i.sync(t.join(v, "src"), {
            force: !0
        })
    } catch (e) {
        Editor.error(e)
    }
}

function W() {
    let e = t.join(v, ".cocos-project.json");
    if (!r.existsSync(e)) return Editor.error(`Can't find project json [${e}]`), void 0;
    let i = JSON.parse(r.readFileSync(e)),
        n = i.projectName,
        o = i.packageName,
        a = n !== _,
        s = o !== O;
    if (!a && !s) return;
    let l = t.join(v, "cocos-project-template.json");
    if (!r.existsSync(l)) return Editor.error(`Can't find template json [${l}]`), void 0;
    let c, d = JSON.parse(r.readFileSync(l)).do_add_native_support;
    s && (c = (c = (c = d.project_replace_package_name.files).concat(d.project_replace_mac_bundleid.files)).concat(d.project_replace_ios_bundleid.files)).forEach(function (e) {
        let i = t.join(v, e);
        if (!r.existsSync(i)) return Editor.error(`Can't not find file [${e}], replace package name failed`), void 0;
        let n = r.readFileSync(i, "utf8");
        n = n.replace(new RegExp(o, "gm"), O), r.writeFileSync(i, n)
    }), a && ((c = d.project_replace_project_name.files).forEach(e => {
        let i = t.join(v, e.replace("PROJECT_NAME", n));
        if (!r.existsSync(i)) return Editor.error(`Can't not find file [${i}], replace project name failed`), void 0;
        let o = r.readFileSync(i, "utf8");
        o = o.replace(new RegExp(n, "gm"), _), r.writeFileSync(i, o)
    }), (c = d.project_rename.files).forEach(e => {
        let i = t.join(v, e.replace("PROJECT_NAME", n));
        if (!r.existsSync(i)) return Editor.error(`Can't not find file [${i}], replace project name failed`), void 0;
        let o = t.join(v, e.replace("PROJECT_NAME", _));
        r.renameSync(i, o)
    })), i.projectName = _, i.packageName = O, r.writeFileSync(e, JSON.stringify(i, null, 2))
}

function G(e, i) {
    const n = require("plist");
    let o = t.join(v, "frameworks/runtime-src/proj.ios_mac/ios/Info.plist");
    if (r.existsSync(o)) {
        let t = r.readFileSync(o, "utf8"),
            i = n.parse(t),
            a = [];
        e.landscapeRight && a.push("UIInterfaceOrientationLandscapeRight"), e.landscapeLeft && a.push("UIInterfaceOrientationLandscapeLeft"), e.portrait && a.push("UIInterfaceOrientationPortrait"), e.upsideDown && a.push("UIInterfaceOrientationPortraitUpsideDown"), i.UISupportedInterfaceOrientations = a, t = n.build(i), r.writeFileSync(o, t)
    }
    let a = [t.join(v, "frameworks/runtime-src/proj.android-studio/app/AndroidManifest.xml"), t.join(v, "frameworks/runtime-src/proj.android-studio/game/AndroidManifest.xml")].filter(e => r.existsSync(e));
    for (let t = 0, n = a.length; t < n; t++) {
        let n = a[t],
            o = n.indexOf("proj.android-studio") >= 0,
            s = /android:screenOrientation=\"[^"]*\"/,
            l = 'android:screenOrientation="unspecified"';
        if (e.landscapeRight && e.landscapeLeft && e.portrait && e.upsideDown) l = 'android:screenOrientation="fullSensor"';
        else if (e.landscapeRight && !e.landscapeLeft) l = 'android:screenOrientation="landscape"';
        else if (!e.landscapeRight && e.landscapeLeft) l = 'android:screenOrientation="reverseLandscape"';
        else if (e.landscapeRight && e.landscapeLeft) l = 'android:screenOrientation="sensorLandscape"';
        else if (e.portrait && !e.upsideDown) l = 'android:screenOrientation="portrait"';
        else if (!e.portrait && e.upsideDown) {
            let e = "reversePortrait";
            i < 16 && !o && (e = "reversePortait"), l = `android:screenOrientation="${e}"`
        } else if (e.portrait && e.upsideDown) {
            let e = "sensorPortrait";
            i < 16 && !o && (e = "sensorPortait"), l = `android:screenOrientation="${e}"`
        }
        let c = r.readFileSync(n, "utf8");
        c = c.replace(s, l), r.writeFileSync(n, c)
    }
}

function Y(e) {
    let t = e.match("android-([0-9]+)$"),
        r = -1;
    return t && (r = parseInt(t[1])), r
}
var X = [
    ["USE_VIDEO", "VideoPlayer"],
    ["USE_WEBVIEW", "WebView"],
    ["USE_EDIT_BOX", "EditorBox"],
    ["USE_CREATOR_PHYSICS", "Physics"],
    ["USE_CREATOR_CAMERA", "Camera"],
    ["USE_CREATOR_GRAPHICS", "Graphics"],
    ["USE_AUDIO", "AudioSource"],
    ["USE_SPINE", "Spine Skeleton"],
    ["USE_DRAGON_BONES", "DragonBones"],
    ["USE_NET_WORK", "Native NetWork"]
];

function Q(e) {
    let i = t.join(v, "frameworks/runtime-src/Classes/jsb_module_register.cpp");
    if (!r.existsSync(i)) return Editor.failed(`Can not find file ${i}`), void 0;
    let n = r.readFileSync(i, "utf8").split("\n");
    for (let t = 0; t < n.length; t++) {
        let r = n[t];
        for (let i = 0; i < X.length; i++) {
            let o = X[i];
            if (-1 !== r.indexOf(`#define ${o[0]}`)) {
                -1 !== e.excludedModules.indexOf(o[1]) ? -1 === r.indexOf("//") && (n[t] = "//" + r) : n[t] = r.replace(/\/\//g, "")
            }
        }
    }
    r.writeFileSync(i, n.join("\n"))
}
let Z, ee, te, re, ie;

function ne() {
    Z && (ee = !0, o(Z.pid, "SIGTERM", () => {
        ee = !1
    }), Z = null)
}

function oe() {
    te && (o(te.pid), te = null)
}

function ae() {
    re && (o(re.pid), re = null, Editor.Panel.close("simulator-debugger"))
}
module.exports = {
    build: function (e, n) {
        M(e, o => {
            if (o = o || q()) return n && n(o), void 0;
            let a = Y(e.apiLevel);
            if (a = a > 0 ? a : U, !r.existsSync(v)) {
                Editor.log("Creating native cocos project to ", v);
                let s = "tempCocosProject",
                    l = t.join(w, s);
                if (r.existsSync(l)) try {
                    i.sync(l, {
                        force: !0
                    })
                } catch (o) {
                    return n && n(o), void 0
                }
                Editor.Ipc.sendToMain("builder:state-changed", "creating native project", .05);
                let c = D(["new", s, "-l", "js", "-d", w, "-t", C, "--env", j]);
                return c.error ? (n && n(c.error), void 0) : (J(c.child, (i, o) => i ? (n && n(i), void 0) : 0 !== o ? (n && n(new Error("Failed to create project with exitCode : " + o)), void 0) : (r.rename(l, v, i => {
                    if (i) return n && n(i), void 0;
                    K(m, i => {
                        let o = t.join(i.templatesPath, "js-template-" + C),
                            l = t.join(o, "cocos-project-template.json"),
                            c = t.join(v, "cocos-project-template.json");
                        r.copySync(l, c);
                        try {
                            (function (e, i) {
                                let n = t.join(v, ".cocos-project.json"),
                                    o = JSON.parse(r.readFileSync(n));
                                o.projectName = e, o.packageName = i, r.writeFileSync(n, JSON.stringify(o, null, 2))
                            })(s, "org.cocos2dx." + s), void("win32" !== process.platform && [t.join(v, "frameworks/runtime-src/proj.android-studio/app/jni/Application.mk")].forEach(e => {
                                    let t = r.readFileSync(e, "utf8").split("\n");
                                    for (let e = 0; e < t.length; e++) {
                                        let r = t[e];
                                        r.match(/\bAPP_SHORT_COMMANDS\b.*:=.*true/) && (t[e] = "#" + r)
                                    }
                                    r.writeFileSync(e, t.join("\n"))
                                })), W(),
                                function () {
                                    if ("android-instant" !== C) {
                                        let e = t.join(v, `frameworks/runtime-src/proj.ios_mac/${_}.xcodeproj/project.pbxproj`);
                                        if (r.existsSync(e)) {
                                            let i = r.readFileSync(e, "utf8");
                                            i = i.replace(/\/Applications\/CocosCreator.app\/Contents\/Resources\/cocos2d-x/g, t.resolve(g)), r.writeFileSync(e, i)
                                        } else Editor.warn(`Can't find path [${e}]. Replacing project file failed`)
                                    }
                                    let e = [t.join(v, "frameworks/runtime-src/proj.android-studio/build-cfg.json"), t.join(v, "frameworks/runtime-src/proj.android-studio/settings.gradle"), t.join(v, "frameworks/runtime-src/proj.android-studio/app/build.gradle")];
                                    "android-instant" !== C && (e.push(t.join(v, "frameworks/runtime-src/proj.win32/build-cfg.json")), e.push(t.join(v, `frameworks/runtime-src/proj.win32/${_}.vcxproj`)), e.push(t.join(v, `frameworks/runtime-src/proj.win32/${_}.sln`))), e.forEach(e => {
                                        if (!r.existsSync(e)) return Editor.warn(`Replace file [${e}] not find.`), void 0;
                                        let i = r.readFileSync(e, "utf8"),
                                            n = t.resolve(g),
                                            o = t.basename(e);
                                        "build-cfg.json" !== o && "settings.gradle" !== o && "build.gradle" !== o || (n = n.replace(/\\/g, "/")), i = (i = i.replace(/\$\{COCOS_X_ROOT\}/g, n)).replace(/\$\(COCOS_X_ROOT\)/g, n), r.writeFileSync(e, i)
                                    })
                                }(), z(), H(e), G(e.orientation, a), Q(e)
                        } catch (e) {
                            return n && n(e), void 0
                        }
                        n && n()
                    })
                }), void 0)), void 0)
            }
            try {
                z(), W(), H(e), G(e.orientation, a),
                    function () {
                        let e = t.join(v, ".cocos-project.json");
                        if (!r.existsSync(e)) return Editor.failed(`Can't find project json [${e}]`), void 0;
                        let i = JSON.parse(r.readFileSync(e)).engine_version;
                        i !== F && Editor.failed(`Project version [${i}] not match cocos2d-x-lite version [${F}]. Please delete your build path, then rebuild project.`)
                    }(), Q(e)
            } catch (o) {
                return n && n(o), void 0
            }
            n && n()
        })
    },
    compile: function (e, t) {
        Editor.Ipc.sendToMain("builder:state-changed", "init settings", 0), M(e, i => {
            if (i = i || q()) return t && t(i), void 0;
            if (!r.existsSync(v)) return t && t(new Error(`Can't find ${v}, please first build project`)), void 0;
            Editor.Ipc.sendToMain("builder:state-changed", "compile native", .1), Editor.log("Start to compile native project. Please wait..."), Editor.log(`The log file path [ ${u} ]`);
            let n = ["compile", "-p", "android-instant" === h ? "android" : h, "-m", P ? "debug" : "release", "--compile-script", 0, "--env", j],
                o = {
                    cwd: v
                };
            "android-instant" === h && n.push("--instant-game");
            let a = U;
            if ("android" === h || "android-instant" === h) {
                if (n.push("--android-studio"), e.apiLevel) {
                    let t = Y(e.apiLevel);
                    t > 0 && (n.push("--ap"), n.push(e.apiLevel), a = t)
                }
                e.appABIs && e.appABIs.length > 0 && (n.push("--app-abi"), n.push(e.appABIs.join(":")))
            }
            if ("win32" === h) {
                let t = "";
                t = "auto" === e.vsVersion ? "2015" : e.vsVersion, n.push("--vs"), n.push(t)
            }
            G(e.orientation, a);
            let s = D(n, o);
            if (s.error) return t && t(s.error), void 0;
            let l = .1;

            function c() {
                (l += 5e-4) > .9 && (l = .9), Editor.Ipc.sendToMain("builder:state-changed", "compile native", l)
            }(Z = s.child).stdout.on("data", () => {
                c()
            }), Z.stderr.on("data", () => {
                c()
            }), J(Z, (e, r, i) => {
                if (e) return t && t(e), void 0;
                if (Z = null, 0 === r) Editor.Ipc.sendToMain("builder:state-changed", "finish", 1), Editor.log("Compile native project successfully.");
                else {
                    if (!ee && "SIGTERM" !== i) return t && t(new Error(`Compile failed. The log file path [ ${u} ]`)), void 0;
                    Editor.log("Compile native project exited normal")
                }
                t && t()
            })
        })
    },
    encryptJsFiles: function (e, n) {
        M(e, o => {
            if (o) return n && n(o), void 0;
            if (!r.existsSync(v)) return n && n(new Error(`Can't find ${v}, please first build project`)), void 0;
            if (!e.xxteaKey) return n && n(new Error("xxtea key is empty.")), void 0;
            (function (e) {
                let i = t.join(v, "frameworks/runtime-src/Classes/AppDelegate.cpp");
                if (!r.existsSync(i)) return Editor.warn(`Can't find path [${i}]`), void 0;
                let n = r.readFileSync(i, "utf8").split("\n");
                for (let t = 0; t < n.length; t++) - 1 !== n[t].indexOf("jsb_set_xxtea_key") && (n[t] = `    jsb_set_xxtea_key("${e.xxteaKey}");`);
                r.writeFileSync(i, n.join("\n"))
            })(e);
            let a = t.join(v, "src", "**/*.js");
            l(a, (o, a) => {
                if (o) return n && n(o), void 0;
                a.forEach(n => {
                    n = t.normalize(n);
                    try {
                        let o = r.readFileSync(n, "utf8");
                        e.zipCompressJs ? (o = d.gzipSync(o), o = c.encrypt(o, c.toBytes(e.xxteaKey))) : o = c.encrypt(c.toBytes(o), c.toBytes(e.xxteaKey)), r.writeFileSync(t.join(t.dirname(n), t.basenameNoExt(n)) + ".jsc", o), i.sync(n, {
                            force: !0
                        })
                    } catch (e) {
                        Editor.warn(e)
                    }
                }), n && n()
            })
        })
    },
    run: function (e, i) {
        oe(), Editor.log("Start to run project"), M(e, o => {
            if (o) return i && i(o), void 0;
            if (!r.existsSync(v)) return i && i(new Error(`Can't find ${v}, please first build project`)), void 0;
            Editor.log("Start to run project. Please wait..."), Editor.log(`The log file path [ ${u} ]`);
            let a = ["run", "-p", "android-instant" === h ? "android" : h, "-m", P ? "debug" : "release", "--env", j, "--compile-script", 0],
                s = {
                    cwd: v
                };
            if ("android-instant" === h) {
                let t = e["android-instant"];
                a.push("--instant-game"), t.scheme && t.host && t.pathPattern && (a.push("--launch-url"), a.push(`${t.scheme}://${t.host}${t.pathPattern}`))
            }
            let l = U;
            if ("android" === h || "android-instant" === h) {
                if (a.push("--android-studio"), e.apiLevel) {
                    let t = Y(e.apiLevel);
                    t > 0 && (a.push("--ap"), a.push(e.apiLevel), l = t)
                }
                e.appABIs && e.appABIs.length > 0 && (a.push("--app-abi"), a.push(e.appABIs.join(":")))
            }
            if ("win32" === h && "auto" !== e.vsVersion && (a.push("--vs"), a.push(e.vsVersion)), G(e.orientation, l), "win32" === process.platform && "win32" === h) {
                let e;
                e = P ? t.join(v, "simulator/win32", _ + ".exe") : t.join(v, "publish/win32", _ + ".exe");
                try {
                    te = n(e, {}, s)
                } catch (o) {
                    return i && i(o), void 0
                }
            } else {
                let e = D(a, s);
                if (e.error) return i && i(e.error), void 0;
                te = e.child
            }
            J(te, (e, t) => e ? (i && i(e), void 0) : 0 !== t ? (i && i(new Error(`Failed to run project. The log file path [ ${u} ]`)), void 0) : (i && i(), void 0))
        })
    },
    runSimulator: function (o) {
        ae();
        let s, l, c, d = Editor.Profile.load("profile://global/settings.json").data;
        d && d["simulator-debugger"] && Editor.Panel.open("simulator-debugger");
        let u = Editor.url("unpack://static/simulator/"),
            f = "utf-8";
        "darwin" === process.platform ? (c = Editor.url("unpack://simulator/mac/Simulator.app"), s = t.join(c, "Contents/MacOS/Simulator"), l = t.join(c, "Contents/Resources")) : "win32" === process.platform && (c = Editor.url("unpack://simulator/win32"), s = t.join(c, "Simulator.exe"), l = c);
        let E = Editor.url("unpack://engine/bin");
        [{
            src: Editor.url("unpack://static/preview-templates/modular.js"),
            dst: t.join(l, "src/modular.js")
        }, {
            src: t.join(E, "cocos2d-jsb-for-preview.js"),
            dst: t.join(l, "src/cocos2d-jsb.js")
        }, {
            src: t.join(u, "asset-record-pipe.js"),
            dst: t.join(l, "src/asset-record-pipe.js")
        }, {
            src: t.join(u, "simulator-config.js"),
            dst: t.join(l, "src/simulator-config.js")
        }, {
            src: Editor.url("packages://jsb-adapter/dist"),
            dst: t.join(l, "jsb-adapter")
        }].forEach(e => {
            r.copySync(e.src, e.dst)
        });
        let m = t.join(Editor.Project.path, "temp/internal"),
            g = Editor.url("unpack://static/default-assets");
        i.sync(m, {
            force: !0
        }), r.copySync(g, m), a.series([e => {
            if (o) {
                r.ensureDirSync(o.recordPath), r.emptyDirSync(o.recordPath), "win32" === process.platform && (o.recordPath = o.recordPath.replace(/\\/g, "/"));
                let e = r.readFileSync(t.join(u, "simulator-config.js"), "utf-8");
                e = (e = e.replace(/CC_SIMULATOR_RECORD_MODE\s=\sfalse/g, "CC_SIMULATOR_RECORD_MODE = true")).replace(/CC_SIMULATOR_RECORD_PATH\s=\s""/g, `CC_SIMULATOR_RECORD_PATH = "${o.recordPath}"`), r.writeFileSync(t.join(l, "src/simulator-config.js"), e)
            }
            e()
        }, e => {
            let i = r.readFileSync(t.join(u, "main.js"), "utf-8"),
                n = t.join(Editor.Project.path, "library/imports"),
                o = Editor.Project.path,
                a = Editor.QuickCompiler.getTempPath();
            "win32" === process.platform && (n = n.replace(/\\/g, "/"), o = o.replace(/\\/g, "/"), a = a.replace(/\\/g, "/")), i = (i = (i = i.replace(/{libraryPath}/g, `'${n}/'`)).replace(/{rawAssetsBase}/g, `'${o}/'`)).replace(/{tempScriptsPath}/g, `'${a}/'`);
            let s = p.getSimulatorConfig();
            s && s.init_cfg.waitForConnect && (i = "debugger\n" + i), r.writeFileSync(t.join(l, "main.js"), i), e()
        }, e => {
            var i = Editor.isWin32 ? "win32" : "mac";
            Editor.PreviewServer.query("settings.js", i, (i, n) => {
                if (i) return e(i), void 0;
                let o = n;
                o = o.replace(/"?internal"?:/, '"temp/internal":'), r.writeFileSync(t.join(l, "src/settings.js"), o), e()
            })
        }, e => {
            let i = t.join(l, "preview-scene.json");
            Editor.PreviewServer.getPreviewScene(function (t) {
                e(t)
            }, function (t) {
                r.writeFile(i, t, e)
            }, function (t) {
                r.copy(t, i, e)
            })
        }, e => {
            B((t, r) => {
                f = r, e(t)
            })
        }], t => {
            if (t) return Editor.failed(t), void 0;
            let r = ["-workdir", l, "-writable-path", l, "-console", "false", "--env", j];
            try {
                re = n(s, r)
            } catch (t) {
                return Editor.error(t), void 0
            }
            let i = (e, t) => {
                if (e) return Editor.error(e), void 0;
                0 === t && (re = null)
            };
            re.stderr.on("data", t => {
                let r;
                (r = "win32" === process.platform ? e.decode(t, f) : t.toString()).length > 1 && (r = r.replace(/\n*$/g, ""));
                let i = "error"; - 1 !== r.toLowerCase().indexOf("warning") && (i = "warn"), Editor.Ipc.sendToPanel("scene", "scene:print-simulator-log", r, i)
            }), re.stdout.on("data", t => {
                let r;
                (r = "win32" === process.platform ? e.decode(t, f) : t.toString()).length > 1 && (r = r.replace(/\n*$/g, "")), r.split("\n").forEach(e => {
                    Editor.Ipc.sendToPanel("scene", "scene:print-simulator-log", e)
                })
            }), re.on("close", (e, t) => {
                i.call(re, null, e, t), Editor.Panel.close("simulator-debugger")
            }), re.on("error", function (e) {
                i.call(re, e), Editor.Panel.close("simulator-debugger")
            })
        })
    },
    saveKeystore: function (e, o) {
        let a = "keytool";
        if ("win32" === process.platform) {
            if (!process.env.JAVA_HOME || !r.existsSync(process.env.JAVA_HOME)) return o && o(new Error("Please make sure java is installed and JAVA_HOME is in your environment")), void 0;
            if (a = t.join(process.env.JAVA_HOME, "bin/keytool.exe"), !r.existsSync(a)) return o && o(new Error(`Can't find path [${a}]. Please make sure JAVA_HOME is in your environment and exists`)), void 0
        }
        let s = e.dest;
        r.existsSync(s) && i.sync(s, {
            force: !0
        });
        let l = [];
        e.commonName && l.push(`CN=${e.commonName}`), e.organizationalUnit && l.push(`OU=${e.organizationalUnit}`), e.organization && l.push(`O=${e.organization}`), e.locality && l.push(`L=${e.locality}`), e.state && l.push(`S=${e.state}`), e.country && l.push(`C=${e.country}`), l = l.join(",");
        let c = ["-genkey", "-keyalg", "RSA", "-keysize", "1024", "-validity", e.validity, "-keystore", t.basename(s), "-storepass", e.password, "-alias", e.alias, "-keypass", e.aliasPassword, "-dname", l];
        Editor.log("Creating keystore : ", c.join(" "));
        let d, p = {
            cwd: t.dirname(s)
        };
        try {
            d = n(a, c, p)
        } catch (e) {
            return o && o(e), void 0
        }
        J(d, (e, t) => e ? (o && o(e), void 0) : 0 !== t ? (o && o(new Error("Failed to create keystore, please check the log information")), void 0) : (o(), void 0))
    },
    openNativeLogFile: function () {
        r.ensureFileSync(u), s.shell.openItem(u)
    },
    stopCompile: ne,
    getCocosTemplates: function (e) {
        let r = Editor.Profile.load("profile://local/settings.json"),
            i = r.data;
        !1 !== r.data["use-global-engine-setting"] && (i = Editor.Profile.load("profile://global/settings.json").data), i["use-default-cpp-engine"] ? (g = Editor.builtinCocosRoot) || Editor.error("Can not find builtin cocos engine, please run 'gulp update-native'.") : (g = i["cpp-engine-path"]) || Editor.error("Can not find cocos engine."), K(t.join(g, "tools", "cocos2d-console", "bin"), t => {
            e && e(null, t.templates)
        })
    },
    getAndroidAPILevels: function (e) {
        let i = Editor.App._profile.data["android-sdk-root"];
        if (!r.isDirSync(i)) return e(null, []), void 0;
        let n = t.join(i, "platforms", "android-*");
        l(n, (i, n) => {
            let o = [];
            n.forEach(e => {
                e = t.normalize(e);
                let i = t.basename(e);
                Y(i) >= U && r.isDirSync(e) && o.push(i)
            }), e && e(null, o)
        })
    },
    getAndroidInstantAPILevels: function (e) {
        let i = Editor.App._profile.data["android-sdk-root"];
        if (!r.isDirSync(i)) return e(null, []), void 0;
        let n = t.join(i, "platforms", "android-*");
        l(n, (i, n) => {
            let o = [];
            n.forEach(e => {
                e = t.normalize(e);
                let i = t.basename(e);
                Y(i) >= V && r.isDirSync(e) && o.push(i)
            }), e && e(null, o)
        })
    },
    stop: function () {
        ne(), oe(), ae(), ie && (o(ie.pid), ie = null)
    },
    showLogInConsole: f,
    getCocosSpawnProcess: D,
    getCocosRoot: L
};