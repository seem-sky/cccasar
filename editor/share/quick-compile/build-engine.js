const e = require("path"),
    n = require("./index.js"),
    r = require("./plugins/babel"),
    i = require("./plugins/module"),
    t = require("./engine-utils/delete-engine-cache");
module.exports = ((u, l) => {
    if (!u.enginePath) return l(new Error("Please specify the engine path")), null;
    let a = new n;

    function o(n) {
        return e.join(u.enginePath, n || "")
    }
    let s = {
        root: o(),
        entries: [o("index.js")],
        out: o("bin/.cache/dev"),
        plugins: [r(), i({
            transformPath: (n, r, i) => e.join("engine-dev", e.relative(i.out, r))
        }), t(o)],
        clear: !1,
        onlyRecordChanged: !0
    };
    return u.enableWatch ? a.watch(s, l) : a.build(s, l), a
});