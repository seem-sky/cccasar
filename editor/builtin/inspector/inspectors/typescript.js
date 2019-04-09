(() => {
    "use strict";
    return {
        dependencies: ["packages://inspector/share/meta-header.js", "packages://inspector/share/code-preview.js"],
        template: '\n      <cc-meta-header\n        :target="target"\n        icon="unpack://static/icon/assets/typescript.png"\n      ></cc-meta-header>\n\n      <cc-code-preview\n        :type="target.__assetType__"\n        :path="target.__path__"\n      >\n      </cc-code-preview>\n    '
    }
})();