var e = require("fire-fs"),
    t = require("fire-path"),
    i = require("async"),
    s = require("./depend"),
    r = require("../utils");
let n = [],
    u = [],
    l = function (e) {
        if (this.info = e, this.type = e.type || "", this.icon = r.getIcon(e.uuid), this.selected = !0, this.parent = null, "sprite-frame" === e.type) {
            let i = Editor.assetdb.remote.loadMetaByUuid(e.uuid);
            this.url = Editor.assetdb.remote.uuidToFspath(i.rawTextureUuid), this.name = t.basename(this.url)
        } else this.url = e.path, this.name = t.basename(e.path)
    },
    h = function (e, t) {
        this.name = e || "", this.url = t || "", this.children = [], this.type = "directory", this.folded = !0, this.selected = !0, this.parent = null
    };

function d(i, s, r, o, a) {
    let p = o[++i];
    if (s = t.join(s, p), e.statSync(s).isDirectory()) {
        let e = function (e) {
            for (let t = 0; t < n.length; ++t) {
                let i = n[t];
                if (i.url === e) return i
            }
            return null
        }(s);
        e || ((e = new h(p, s)).parent = r, r.children.push(e), n.push(e)), d(i, s, e, o, a)
    } else if (! function (e) {
            return -1 !== u.indexOf(e)
        }(a.uuid)) {
        let e = new l(a);
        e.parent = r, r.children.push(e), u.push(a.uuid)
    }
}
module.exports = {
    queryAssetTreeByUuidList: function (e, r) {
        n = [], void(u = []);
        let o = new h("Assets");
        i.each(e, (e, i) => {
            Editor.assetdb.queryInfoByUuid(e, (e, r) => e ? i() : -1 !== r.url.indexOf(s.INTERNAL) ? i() : (function (e, i) {
                let s = e.url.slice("db://assets/".length).split("/");
                if (1 === s.length) {
                    let t = new l(e);
                    t.parent = i, i.children.push(t), u.push(e.uuid)
                } else d(-1, t.join(Editor.Project.path, "assets"), i, s, e)
            }(r, o), i(), void 0))
        }, () => {
            s.sortAssetTree(o, r(null, o))
        })
    }
};