const e = require("fire-path"),
    t = Editor.require("app://editor/share/build-platforms");
module.exports = {
    getAbsoluteBuildPath: t => (e.posix.isAbsolute(t) || e.win32.isAbsolute(t) || (t = e.join(Editor.Project.path, t)), t),
    getOptions(e, t) {
        e || (e = Editor.isMainProcess ? Editor.Profile.load("profile://project/builder.json") : Editor.remote.Profile.load("profile://project/builder.json")), t || (t = Editor.isMainProcess ? Editor.Profile.load("profile://local/builder.json") : Editor.remote.Profile.load("profile://local/builder.json"));
        let o = e.data,
            i = t.data,
            r = Object.assign({}, o, i);
        return this.updateOptions(r), r
    },
    getCommonOptions: function (e) {
        e || (e = this.getOptions());
        let t = Object.assign({}, e);
        return delete t.keystorePath, delete t.keystorePassword, delete t.keystoreAlias, delete t.keystoreAliasPassword, t
    },
    updateOptions(o) {
        let i = o.buildPath = this.getAbsoluteBuildPath(o.buildPath),
            r = e.join(i, o.platform),
            s = t[o.platform];
        "android-instant" === o.platform ? r = e.join(i, o.platform) : s.useTemplate && (r = e.join(i, "jsb-" + o.template)), o.dest = r
    }
};