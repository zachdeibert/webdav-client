const electron = require("electron");
const path = require("path");
const url = require("url");

let win = null;

function loadPage(file) {
    if (win === null) {
        win = new electron.BrowserWindow({
            "width": 800,
            "height": 600,
            "center": true,
            "resizable": false,
            "title": "WebDAV Client"
        });
        win.on("closed", () => {
            win = null;
        });
    }
    win.loadURL(url.format({
        "pathname": path.join(__dirname, file),
        "protocol": "file:",
        "slashes": true
    }));
}

function createWindow() {
    loadPage("index.html");
}

electron.app.on("ready", () => {
    createWindow();
    const tray = new electron.Tray(path.join(__dirname, "icon.png"));
    const contextMenu = electron.Menu.buildFromTemplate([
        {
            "label": "Add New Site",
            "type": "normal",
            "click": () => loadPage("add.html")
        },
        {
            "label": "View Sites",
            "type": "normal",
            "click": () => loadPage("index.html")
        },
        {
            "type": "separator"
        },
        {
            "label": "Show",
            "type": "normal",
            "click": () => {
                if (win === null) {
                    createWindow();
                } else {
                    win.focus();
                }
            }
        },
        {
            "label": "Quit",
            "type": "normal",
            "role": "quit"
        }
    ]);
    tray.setToolTip("WebDAV Client");
    tray.setContextMenu(contextMenu);
});

electron.app.on("window-all-closed", () => {});

electron.app.on("activate", () => {
    if (win === null) {
        createWindow();
    }
});
