# cccasar
refer by https://gist.github.com/benloong/586d6c899c2d84cea557d358311ae9d7

```javascript
var fs = require("fs");
var app = require("electron").remote.app;
var fsj = require("fs-jetpack");

// example usage : copyFileOutsideOfElectronAsar( "", destOutsideAsarArchive)

var copyFileOutsideOfElectronAsar = function(sourceInAsarArchive, destOutsideAsarArchive) {
if ( fs.existsSync( app.getAppPath() + "/" + sourceInAsarArchive ) ) {

            // file will be copied
            if ( fs.statSync( app.getAppPath() + "/" + sourceInAsarArchive ).isFile() ) {

                fsj.file( destOutsideAsarArchive , {content: fs.readFileSync( app.getAppPath() + "/" + sourceInAsarArchive ) });

            }

            // dir is browsed
            else if ( fs.statSync( app.getAppPath() + "/" + sourceInAsarArchive ).isDirectory() ) {

                fs.readdirSync( app.getAppPath() + "/" + sourceInAsarArchive ).forEach(function(fileOrFolderName) {

                    copyFileOutsideOfElectronAsar( sourceInAsarArchive + "/" + fileOrFolderName, destOutsideAsarArchive + "/" + fileOrFolderName );
                });
            }
        }

}
```