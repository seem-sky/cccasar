module.exports = (() => [{
    label: "JavaScript",
    message: "assets:new-asset",
    params: [{
        name: "NewScript.js",
        url: "unpack://static/template/new-script.js"
    }]
}, {
    label: "TypeScript",
    message: "assets:new-asset",
    params: [{
        name: "NewScript.ts",
        url: "unpack://static/template/new-script.ts"
    }]
}, {
    label: "CoffeeScript",
    message: "assets:new-asset",
    params: [{
        name: "NewScript.coffee",
        url: "unpack://static/template/new-script.coffee"
    }]
}, {
    type: "separator"
}, {
    label: "Scene",
    message: "assets:new-asset",
    params: [{
        name: "New Scene.fire",
        url: "unpack://static/template/new-scene.fire"
    }]
}, {
    type: "separator"
}, {
    label: "Animation Clip",
    message: "assets:new-asset",
    params: [{
        name: "New AnimationClip.anim",
        url: "unpack://static/template/new-animation-clip.anim"
    }]
}, {
    type: "separator"
}, {
    label: Editor.T("ASSETS.auto_atlas"),
    message: "assets:new-asset",
    params: [{
        name: "AutoAtlas.pac",
        url: "unpack://static/template/new-auto-atlas.pac"
    }]
}, {
    type: "separator"
}, {
    label: Editor.T("ASSETS.label_atlas"),
    message: "assets:new-asset",
    params: [{
        name: "LabelAtlas.labelatlas",
        url: "unpack://static/template/new-label-atlas.labelatlas"
    }]
}]);