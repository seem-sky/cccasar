module.exports = function () {
    let e = Editor.Profile.load("profile://local/settings.json").data;
    !1 !== e["use-global-engine-setting"] && (e = Editor.Profile.load("profile://global/settings.json").data);
    let o = e["use-default-js-engine"];
    return Editor.dev || !o
};