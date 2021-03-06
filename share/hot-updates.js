"use strict";
const o = require("electron");
let e = null;
e = Editor.isMainProcess ? o.ipcMain : o.ipcRenderer;
const t = require("lodash"),
    n = require("http"),
    r = require("semver");
require("path");

function i(o, e, t, r, i, a) {
    let d = e ? "localhost" : "fbupdater.avosapps.com",
        l = e ? 3e3 : 80,
        s = {
            "X-LC-Id": "qaE6P62XSAGBMtxtbVJJUT5m-gzGzoHsz",
            "X-LC-Key": "OwAmchirvy0Mo6eCEphYJdVg",
            "Content-Type": "application/json; charset=utf-8"
        };
    e && (s.testing = !0), o && (s.version = o);
    let c = "";
    n.request({
        method: "POST",
        host: d,
        port: l,
        path: t,
        headers: s
    }, o => {
        if (o.setEncoding("utf8"), 200 !== o.statusCode) return i(), void 0;
        o.on("data", o => {
            c += o
        }).on("end", () => {
            var o;
            try {
                return (o = JSON.parse(c)) ? (r(o), void 0) : (i(), void 0)
            } catch (o) {
                return a(o), void 0
            }
        })
    }).on("error", o => {
        a(o)
    }).end()
}

function a(o) {
    Editor.log("Query Hot Updates...");
    i(Editor.versions.CocosCreator, o, "/hotupdates/latest", function (o) {
        let e = function (o) {
            let e = Editor.Profile.load("profile://global/updates.json"),
                n = Editor.isDarwin ? "mac" : "win",
                r = [];
            for (let i = 0; i < o.length; ++i) {
                let a, d, l = o[i];
                t.includes(e.data["installed-hotupdates"], l.objectId) || (a = l.package_info[n + "_link"], d = l.package_info.changelog, r.push({
                    url: a,
                    changelog: d,
                    contentType: l.contentType,
                    versionId: l.objectId
                }))
            }
            return console.log(r), r
        }(o);
        return e.length > 0 ? (Editor.log("Hot update content found. Launch Auto Update."), Editor.Ipc.sendToMain("downloader:open", {
            downloads: e
        }), void 0) : (Editor.log("No hot updates available."), void 0)
    }, function () {
        Editor.log("No hot updates available.")
    }, function (o) {
        Editor.warn("Connecting to Auto Update service failed or Data parsing error occurs."), Editor.warn(o)
    })
}
e.on("app:query-fb-update", () => {
    Editor.log("Query updating...");
    i(null, !1, "/versions/latest", function (o) {
        if (function (o) {
                let e = Editor.Profile.load("profile://global/updates.json"),
                    n = !t.includes(e.data["received-ids"], o.objectId),
                    i = Editor.versions.CocosCreator;
                i = r.clean(i);
                let a = r.lt(i, o.version);
                if (n && a) return !0;
                return !1
            }(o)) {
            let e = Editor.isDarwin ? "mac" : "win";
            return Editor.log(`New Version ${o.version} found. Launch Auto Update.`), Editor.Ipc.sendToMain("downloader:open", {
                downloads: [{
                    url: o.package_info[e + "_link"],
                    version: o.version,
                    changelog: o.package_info.changelog,
                    versionId: o.objectId
                }]
            }), void 0
        }
        return Editor.log("No version update available."), a(!1), void 0
    }, function () {
        Editor.log("No version update available."), a(!1)
    }, function (o) {
        Editor.warn("Connecting to Auto Update service failed or Data parsing error occurs."), Editor.warn(o)
    })
});