"use strict";module.exports=function(e,t){let n;if(e){let e=Editor.Selection.contexts("node");e.length>0&&(n=e[0])}else n=Editor.Selection.curActivate("node");let o=Editor.Menu.getMenu("create-node");return Editor.Menu.walk(o,e=>{e.params&&(e.params.push(n),e.params.push(!1))}),t&&Editor.Menu.walk(o,e=>{e.enabled=!1}),o};