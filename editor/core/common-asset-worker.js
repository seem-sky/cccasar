let r, e = {
    async _init() {
        if (!r) return new Promise(e => {
            Editor.App.spawnWorker("app://editor/page/worker/common-asset-worker", function (n, t) {
                (r = n).send("app:init-common-asset-worker", function () {
                    e()
                }, -1)
            }, !1, !0)
        })
    },
    async start(e, n) {
        return await this._init(), new Promise((t, o) => {
            r.send("app:start-common-asset-worker", e, n, function (r, e) {
                if (r) return o(r);
                t(e)
            }, -1)
        })
    }
};
module.exports = e;