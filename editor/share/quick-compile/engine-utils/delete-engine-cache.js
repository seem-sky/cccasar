const e = require("del"),
    n = require("globby");
let r = "undefined" != typeof Editor;
module.exports = function (i) {
    let o = !1;
    return {
        transform() {
            o = !0
        },
        compileFinished(t, c) {
            if (o) {
                let t = [i("bin/.cache/*"), "!" + i("bin/.cache/dev")];
                if (0 == n.sync(t).length) return c();
                r ? Editor.log(Editor.T("QUICK_COMPILER.engine_modified_info")) : console.log("JavaScript Engine changes detected and the build cache was deleted.");
                try {
                    e.sync(t)
                } catch (e) {
                    r ? Editor.error(e) : console.error(e)
                }
                o = !1
            }
            c()
        }
    }
};