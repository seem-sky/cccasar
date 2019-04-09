"use strict";
var r = require("fire-path"),
    e = require("fire-fs"),
    n = require("lodash"),
    i = {};
module.exports = i, i.create = function (n, i, o) {
    let t = Editor.dev ? Editor.url("app://") : r.join(Editor.url("app://"), "..", "..");
    if (Editor.log("install path: " + t), r.contains(t, n)) return o && o(new Error(Editor.T("DASHBOARD.error_project_in_install"))), void 0;
    if (e.existsSync(n)) return o && o(new Error("The path " + n + " already exists.")), void 0;
    var s = Editor.url("unpack://engine"),
        c = JSON.parse(e.readFileSync(r.join(s, "package.json")));
    let a = {
        path: s,
        name: c.name,
        version: c.version,
        description: c.description
    };
    var d = function (i) {
        e.copy(Editor.url("unpack://utils/api/creator.d.ts"), r.join(n, "creator.d.ts"), o => {
            o && Editor.log(o), e.copy(Editor.url("unpack://utils/vscode-extension/jsconfig.json"), r.join(n, "jsconfig.json"), r => {
                r && Editor.log(r), i(r)
            })
        })
    };
    if (i) e.copy(i, n, r => {
        r && console.log(r), d(o)
    });
    else {
        e.mkdirsSync(n), e.mkdirSync(r.join(n, "settings")), e.mkdirSync(r.join(n, "local")), e.mkdirSync(r.join(n, "packages")), e.mkdirSync(r.join(n, "assets")), e.mkdirSync(r.join(n, "library"));
        var p = {
            engine: a.name,
            packages: "packages"
        };
        e.writeFileSync(r.join(n, "project.json"), JSON.stringify(p, null, 2)), e.copySync(Editor.url("unpack://templates/hello-world/.gitignore"), r.join(n, ".gitignore")), d(o)
    }
}, i.add = function (r) {
    let e = Editor.App._profile.data;
    var n = e["recently-opened"].indexOf(r); - 1 !== n && e["recently-opened"].splice(n, 1), e["recently-opened"].unshift(r), Editor.App._profile.save()
}, i.remove = function (r) {
    let e = Editor.App._profile.data;
    n.remove(e["recently-opened"], function (e) {
        return e === r
    }), Editor.App._profile.save()
}, i.check = function (n, o) {
    if (!1 === e.existsSync(n)) return o && o(new Error("Project not exists!")), void 0;
    let t = Editor.dev ? Editor.url("app://") : r.join(Editor.url("app://"), "..", "..");
    if (r.contains(t, n)) return o && o(new Error(Editor.T("DASHBOARD.error_project_in_install_open"))), void 0;
    i.getInfo(n, function (i) {
        if (!i) return o && o(new Error("Can not find project.json")), void 0;
        if (i.error) return o && o(new Error(i.error)), void 0;
        var t = r.join(n, "settings");
        e.existsSync(t) || e.mkdirSync(t), t = r.join(n, "local"), e.existsSync(t) || e.mkdirSync(t), t = r.join(n, "packages"), e.existsSync(t) || e.mkdirSync(t), t = r.join(n, "assets"), e.existsSync(t) || e.mkdirSync(t), t = r.join(n, "library"), e.existsSync(t) || e.mkdirSync(t), o && o(null, i)
    })
}, i.getInfo = function (n, i) {
    var o = r.join(n, "project.json");
    if (!1 === e.existsSync(o)) return i && i(), void 0;
    try {
        JSON.parse(e.readFileSync(o))
    } catch (e) {
        return i && i({
            path: n,
            name: r.basename(n),
            engine: "unknown",
            error: "project.json broken: " + e.message
        }), void 0
    }
    i && i({
        path: n,
        name: r.basename(n)
    })
};