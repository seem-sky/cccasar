(() => {
    "use strict";
    Editor.metas && (Editor.metas.mount = {
        "asset-icon": "unpack://static/icon/assets/mount.png"
    }, Editor.metas.asset["asset-icon"] = "unpack://static/icon/assets/asset.png", Editor.metas.folder["asset-icon"] = "unpack://static/icon/assets/folder.png", Editor.metas["custom-asset"] = Editor.require("app://editor/share/assets/meta/custom-asset"));
    var t = {
        "native-asset": cc.Asset,
        "animation-clip": cc.AnimationClip,
        "audio-clip": cc.AudioClip,
        "bitmap-font": cc.BitmapFont,
        coffeescript: cc._CoffeeScript,
        typescript: cc._TypeScript,
        javascript: cc._JavaScript,
        json: cc.JsonAsset,
        particle: cc.ParticleAsset,
        prefab: cc.Prefab,
        scene: cc.SceneAsset,
        "sprite-atlas": cc.SpriteAtlas,
        "sprite-frame": cc.SpriteFrame,
        texture: cc.Texture2D,
        "texture-packer": cc.SpriteAtlas,
        "ttf-font": cc.TTFFont,
        markdown: cc.TextAsset,
        text: cc.TextAsset,
        "label-atlas": cc.LabelAtlas,
        buffer: cc.BufferAsset,
        mesh: cc.Mesh,
        gltf: cc.Model,
        fbx: cc.Model,
        "skeleton-animation-clip": cc.SkeletonAnimationClip,
        skeleton: cc.Skeleton
    };
    for (var s in t) Editor.assets && (Editor.assets[s] = t[s]), Editor.metas && (Editor.metas[s] = Editor.require(`app://editor/share/assets/meta/${s}`), Editor.metas[s]["asset-icon"] = `unpack://static/icon/assets/${s}.png`), Editor.assettype2name && (Editor.assettype2name[cc.js.getClassName(t[s])] = s);
    Editor.assets.font = cc.Font, Editor.assets.spine = sp.SkeletonData, Editor.metas && (Editor.metas.spine = Editor.require("unpack://engine/extensions/spine/editor/spine-meta"), Editor.metas.spine["asset-icon"] = "unpack://engine/extensions/spine/editor/spine-asset.png"), Editor.assets.dragonbones = dragonBones.DragonBonesAsset, Editor.assets["dragonbones-atlas"] = dragonBones.DragonBonesAtlasAsset, Editor.metas && (Editor.metas.dragonbones = Editor.require("unpack://engine/extensions/dragonbones/editor/dragonbones-meta"), Editor.metas.dragonbones["asset-icon"] = "unpack://engine/extensions/spine/editor/spine-asset.png", Editor.metas["dragonbones-atlas"] = Editor.require("unpack://engine/extensions/dragonbones/editor/dragonbones-atlas-meta"), Editor.metas["dragonbones-atlas"]["asset-icon"] = "unpack://static/icon/assets/dragonbones-atlas.png"), Editor.assets["tiled-map"] = cc.TiledMapAsset, Editor.metas && (Editor.metas["tiled-map"] = Editor.require("unpack://engine/cocos2d/tilemap/editor/tiled-map"), Editor.metas["tiled-map"]["asset-icon"] = "unpack://engine/cocos2d/tilemap/editor/tiled-map.png"), Editor.assets["auto-atlas"] = cc.SpriteAtlas, Editor.metas && (Editor.metas["auto-atlas"] = Editor.require("app://editor/share/assets/meta/auto-atlas"), Editor.metas["auto-atlas"]["asset-icon"] = "unpack://static/icon/assets/auto-atlas.png"), Editor.metas.gltf["asset-icon"] = "unpack://static/icon/assets/prefab.png", Editor.metas.fbx["asset-icon"] = "unpack://static/icon/assets/prefab.png", Editor.metas["skeleton-animation-clip"]["asset-icon"] = "unpack://static/icon/assets/animation-clip.png", Editor.assettype2name && (Editor.assettype2name["cc.RawAsset"] = "raw-asset", Editor.assettype2name["cc.Script"] = "script", Editor.assettype2name["cc.Font"] = "font", Editor.assettype2name["sp.SkeletonData"] = "spine", Editor.assettype2name["cc.TiledMapAsset"] = "tiled-map", Editor.assettype2name["dragonBones.DragonBonesAsset"] = "dragonbones", Editor.assettype2name["dragonBones.DragonBonesAtlasAsset"] = "dragonbones-atlas")
})();