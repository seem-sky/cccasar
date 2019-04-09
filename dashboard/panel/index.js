"use strict";
const e = require("electron"),
    t = (require("path"), require("fs"), require("./utils"));
e.ipcRenderer;
Editor.require("app://share/protocol/protocol-core"), Pace.ignore(() => {}), Pace.once("hide", () => {
    Editor.UI.removeLoadingMask(), Editor.Ipc.sendToAll("editor:ready")
}), Editor.UI.addLoadingMask({
    background: "#333"
}), window.vm = new Vue({
    el: document.getElementById("dashboard"),
    data: {
        tab: 0,
        projects: [],
        templates: [],
        filter: "",
        error: "",
        loading: !1,
        isloggedin: null,
        skip: !Editor.remote.requireLogin
    },
    components: {
        "window-header": require("./components/window-header"),
        tabs: require("./components/tabs"),
        "tab-project": require("./components/tab-project"),
        "tab-create": require("./components/tab-create"),
        "tab-help": require("./components/tab-help"),
        "window-footer": require("./components/window-footer")
    },
    methods: {
        updateProjects() {
            Editor.Ipc.sendToMain("app:query-recent", (e, t) => {
                e && Editor.error(e.message), this.projects = t
            })
        },
        updateTemplates() {
            this.templates = [{
                name: Editor.T("DASHBOARD.template_empty"),
                desc: Editor.T("DASHBOARD.template_empty_desc"),
                banner: "./static/img/empty-project.png"
            }], Editor.Ipc.sendToMain("app:query-templates", (e, t) => {
                e && console.log(e), t.forEach(e => {
                    this.templates.push(e)
                })
            })
        },
        _onLogin() {
            this.isloggedin = !0
        }
    },
    async ready() {
        t.event.on("change-tab", o => {
            if (2 === o) {
                let o = e.remote.dialog.showOpenDialog({
                    title: Editor.T("DASHBOARD.choose_project"),
                    properties: ["openDirectory"]
                });
                return o ? (Editor.Ipc.sendToMain("app:open-project", o[0], !!this.isloggedin, e => {
                    e && t.event.emit("change-error-message", e.message), t.event.emit("update-projects")
                }), void 0) : (this.tab = 0, void 0)
            }
            this.tab = o
        }), t.event.on("change-error-message", e => {
            this.error = e
        }), t.event.on("update-projects", () => {
            this.updateProjects()
        }), t.event.on("update-templates", () => {
            this.updateTemplates()
        }), t.event.on("change-filter", e => {
            this.filter = e
        }), this.updateProjects(), this.updateTemplates(), this.isloggedin = null, Editor.User.on("exception", e => {
            "timeout" === e && (this.loading = !1, this.skip = !0, this.error = "Login timeout, temporarily skipping the login process for you")
        }), this.loading = !0, this.isloggedin = await Editor.User.isLoggedIn(), this.loading = !1
    }
});