const electron = require("electron");
const path = require("path");
const connect = require("./connect");
const urls = require("./urls");
require("./mounts");

electron.app.on("ready", () => {
    const win = new electron.BrowserWindow({
        "width": 800,
        "height": 600,
        "center": true,
        "minWidth": 800,
        "minHeight": 600,
        "show": false
    });
    urls.loadURL(win, "/");
    win.webContents.once("did-finish-load", () => {
        connect.init(win);
        win.show();
    });
    const tray = new electron.Tray(path.join(__dirname, "icon.png"));
    const contextMenu = electron.Menu.buildFromTemplate([
        {
            "label": "Show WebDAV Client",
            "type": "normal",
            "click": () => win.show()
        },
        {
            "label": "Quit WebDAV Client",
            "type": "normal",
            "role": "quit",
            "click": () => electron.app.quit()
        }
    ]);
    tray.setToolTip("WebDAV Client");
    tray.setContextMenu(contextMenu);
});

electron.app.on("window-all-closed", () => {});
