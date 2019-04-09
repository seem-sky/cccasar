"use strict";
const e = require("fire-fs"),
    i = require("path"),
    r = require("electron"),
    t = r.remote.dialog;
exports.template = e.readFileSync(Editor.url("packages://preferences/panel/template/preview.html"), "utf-8"), exports.props = ["preview"], exports.data = function () {
    return {
        orientationList: [{
            value: !0,
            text: Editor.T("PREFERENCES.simulator_device_horizontal")
        }, {
            value: !1,
            text: Editor.T("PREFERENCES.simulator_device_vertical")
        }]
    }
}, exports.watch = {
    "preview.simulatorDebugger"(e) {
        e || (this.preview.simulatorWaitForConnect = !1)
    }
}, exports.methods = {
    T: Editor.T,
    chooseBrowser() {
        let e = Editor.isWin32 ? "Exe" : "App";
        t.showOpenDialog({
            defaultPath: this.preview.previewBrowser,
            properties: ["openFile"],
            filters: [{
                name: e,
                extensions: [e.toLowerCase()]
            }]
        }, e => {
            Array.isArray(e) && (e = e[0]), e && (this.preview.previewBrowserList.some(i => i.value === e) || this.preview.previewBrowserList.push({
                value: e,
                text: i.basename(e)
            }), this.preview.previewBrowser = e)
        })
    },
    removeBrowser() {
        let e = this.preview.previewBrowser;
        this.preview.previewBrowserList.some((i, r) => {
            if (i.value === e) return this.preview.previewBrowserList.splice(r, 1), this.preview.previewBrowser = "default", !0
        })
    },
    openSimulatorDir() {
        let i = this.preview.simulatorPath;
        if (!e.existsSync(i)) return Editor.warn(`Folder does not exist: ${i}`), void 0;
        r.shell.showItemInFolder(i), r.shell.beep()
    },
    onResolutionChange(e) {
        let i = this.preview.resolutionList[e];
        i.width && i.height && (this.preview.customizeSize.width = i.width, this.preview.customizeSize.height = i.height)
    },
    onLandscapeChanged(e) {
        this.preview.isLandscape = "true" === e.target.value
    },
    onCustomizeSizeChange() {
        this.preview.resolution = this.preview.resolutionList.length - 1
    }
}, exports.created = function () {};