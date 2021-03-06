const electron = require("electron");
const path = require("path");
const psTree = require("ps-tree");
const connect = require("./connect");
const urls = require("./urls");
const mounts = require("./mounts");

let tray;

electron.app.on("ready", () => {
    const win = new electron.BrowserWindow({
        "width": 800,
        "height": 600,
        "center": true,
        "minWidth": 800,
        "minHeight": 600,
        "show": false,
        "icon": path.join(__dirname, "icon.png")
    });
    win.setMenu(null);
    urls.loadURL(win, "/");
    win.webContents.once("did-finish-load", () => {
        connect.init(win);
        if (process.argv.indexOf("--hide") < 0) {
            win.show();
        }
    });
    win.on("minimize", ev => {
        ev.preventDefault();
        win.hide();
    });
    win.on("close", ev => {
        ev.preventDefault();
        win.hide();
        return false;
    });
    tray = new electron.Tray(path.join(__dirname, "icon.png"));
    const contextMenu = electron.Menu.buildFromTemplate([
        {
            "label": "Show WebDAV Client",
            "click": () => win.show()
        },
        {
            "label": "Quit WebDAV Client",
            "click": () => {
                electron.app.quit();
                psTree(process.pid, (err, children) => {
                    if (err) {
                        console.error(err);
                    } else {
                        for (var i = 0; i < children.length; ++i) {
                            process.kill(children[i].PID);
                        }
                    }
                });
                mounts.quit();
                process.exit();
            }
        }
    ]);
    tray.setToolTip("WebDAV Client");
    tray.setContextMenu(contextMenu);
});

electron.app.on("window-all-closed", () => {});
