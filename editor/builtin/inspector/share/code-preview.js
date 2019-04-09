"use strict";
Vue.component("cc-code-preview", {
    template: '\n    <style type="text/css">\n      @import url(\'packages://inspector/share/code-preview.tomorrow-night-eighties.css\');\n\n      pre.code {\n        position: relative;\n        overflow: auto;\n\n        border: 1px solid #212121;\n        background: #333;\n\n        margin: 0px;\n        padding: 10px;\n        font-size: 12px;\n        font-family: Consolas, "Liberation Mono", Menlo, Courier, monospace;\n\n        -webkit-user-select: text;\n        cursor: auto;\n      }\n\n      pre.code::selection {\n        background: #007acc;\n      }\n\n      pre.code * {\n        -webkit-user-select: text;\n      }\n\n      pre.code *::selection {\n        background: #007acc;\n      }\n    </style>\n    <pre v-el:code class="code flex-1"></pre>\n  ',
    props: {
        type: String,
        path: String
    },
    watch: {
        path: "_updateText",
        type: "_updateText"
    },
    compiled() {
        this._updateText()
    },
    methods: {
        _updateText() {
            this.path && "unknown" !== this.type && this._highlightCode()
        },
        _highlightCode() {
            const e = require("fire-fs"),
                t = require("event-stream");
            let n = e.createReadStream(this.path, {
                    encoding: "utf-8"
                }),
                i = 400,
                o = "",
                s = n.pipe(t.split()).pipe(t.mapSync(e => {
                    o += e + "\n", --i <= 0 && (o += "...\n", n.close(), s.push(null), s.end())
                })).on("close", function (e) {
                    if (e) throw e;
                    (function () {
                        let e = this.$els.code;
                        if (!e) return;
                        if ("text" !== this.type) {
                            const t = require("highlight.js");
                            let n = t.highlight(this.type, o);
                            e.innerHTML = n.value
                        } else e.innerHTML = o
                    }).apply(this)
                }.bind(this))
        }
    }
});