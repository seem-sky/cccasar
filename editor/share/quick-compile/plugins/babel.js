const e = require("babel-core");
module.exports = function () {
    return {
        transform(r) {
            if (-1 !== r.src.indexOf(".json")) return;
            let s = e.transform(r.source, {
                ast: !1,
                highlightCode: !1,
                sourceMaps: "inline",
                compact: !1,
                filename: r.src,
                presets: ["env"],
                plugins: []
            });
            r.source = s.code
        }
    }
};