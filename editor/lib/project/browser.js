"use strict";
const t = require("fire-fs"),
    i = require("fire-path"),
    {
        tmpdir: e
    } = require("os"),
    {
        join: r,
        resolve: o
    } = require("path"),
    {
        promisify: a
    } = require("util"),
    s = require("../../../share/project");
module.exports = new class {
    constructor() {
        this.path = "", this.name = "", Editor.argv._command ? this.path = r(e(), "fireball-tmp-project") : Editor.argv._.length > 0 ? this.path = o(Editor.argv._[0]) : Editor.argv.path && (this.path = o(Editor.argv.path))
    }
    async check() {
        t.existsSync(this.path) || (Editor.log("Create project %s", this.path), await a(s.create(this.path, null))), Editor.log("Check project %s", this.path);
        let i = await a(s.check)(this.path);
        this.name = i.name
    }
    async init() {
        Editor.log("Initializing project %s", this.path), t.ensureDirSync(i.join(this.path, "settings")), Editor.Profile.register("project", i.join(this.path, "settings")), t.ensureDirSync(i.join(this.path, "local")), Editor.Profile.register("local", i.join(this.path, "local"));
        let e = Editor.Profile.load("profile://local/settings.json");
        try {
            e.reload()
        } catch (t) {
            e.save(), e.reload()
        }
        Editor.Package.addPath([i.join(Editor.App.home, "packages"), i.join(this.path, "packages")]), Editor._projectLocalProfile = Editor.Profile.load("profile://local/local.json", {
            "last-edit": ""
        }), Editor._projectProfile = Editor.Profile.load("profile://project/project.json", {
            "start-scene": "current",
            "group-list": ["default"],
            "collision-matrix": [
                [!0]
            ],
            "excluded-modules": [],
            "design-resolution-width": 960,
            "design-resolution-height": 640,
            "fit-width": !1,
            "fit-height": !0,
            "use-project-simulator-setting": !1,
            "simulator-orientation": !1,
            "use-customize-simulator": !1,
            "simulator-resolution": {
                width: 960,
                height: 640
            },
            "cocos-analytics": {
                enable: !1,
                appID: "13798",
                appSecret: "959b3ac0037d0f3c2fdce94f8421a9b2"
            }
        })
    }
};