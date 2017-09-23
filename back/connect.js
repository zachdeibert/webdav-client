const electron = require("electron");
const electronSettings = require("electron-settings");
const fs = require("fs");
const path = require("path");
const urls = require("./urls");

exports.init = win => {
    let connectUrl = null;

    electron.ipcMain.on("connect", (ev, url) => {
        connectUrl = url;
        setTimeout(() => win.loadURL(url), 100);
    });

    electron.ipcMain.on("disconnect", (ev, id) => {
        let sites = electronSettings.get("sites", []);
        let site = null, i;
        for (i = 0; i < sites.length; ++i) {
            if (sites[i].id == id) {
                site = sites[i];
                break;
            }
        }
        if (site === null) {
            console.error(`Unknown site '${id}'`);
        } else {
            if (site.mount !== false) {
                electron.ipcMain.emit("unmount", id);
            }
            sites.splice(i, 1);
            electronSettings.set("sites", sites);
            electron.ipcMain.emit("update");
        }
    });

    win.webContents.on("did-finish-load", () => {
        if (win.webContents.getURL() == connectUrl) {
            fs.readFile(path.join(__dirname, "connect-client.js"), "utf8", (err, data) => {
                win.webContents.executeJavaScript(data, args => {
                    let sites = electronSettings.get("sites", []);
                    sites.push({
                        "id": new Date().toUTCString(),
                        "url": connectUrl,
                        "mount": false,
                        "title": args[0],
                        "icon": args[1]
                    });
                    electronSettings.set("sites", sites);
                    electron.ipcMain.emit("update");
                    connectUrl = null;
                    urls.loadURL(win, "/");
                });
            });
        }
    });
};
