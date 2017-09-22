const electron = require("electron");
const electronSettings = require("electron-settings");
const http = require("http");
const httpProxy = require("http-proxy");
const path = require("path");
const url = require("url");

let win = null;
let connectUrl = null;
let servers = {};

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
        win.webContents.on("did-finish-load", () => {
            if (win.webContents.getURL() == connectUrl) {
                win.webContents.executeJavaScript("fetch(document.querySelector(\"link[rel='shortcut icon']\").href).then(res => res.blob()).then(blob => new Promise((resolve, reject) => {var f = new FileReader(); f.readAsDataURL(blob); f.onload = function() { resolve(f.result); }; return f;})).then(icon => [document.title, icon])", args => {
                    let cookies = electron.session.defaultSession.cookies.get({
                        "url": connectUrl
                    }, (err, cookies) => {
                        if (err) {
                            console.error(err);
                        } else {
                            let sites = electronSettings.get("sites", []);
                            sites.push({
                                "id": new Date().toUTCString(),
                                "url": connectUrl,
                                "mount": null,
                                "cookies": cookies.map(c => `${c.name}=${c.value}`).join("; "),
                                "title": args[0].split("-", 2)[0].trim(),
                                "icon": args[1]
                            });
                            electronSettings.set("sites", sites);
                            connectUrl = null;
                            loadPage("index.html");
                        }
                    });
                });
            }
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

electron.ipcMain.on("connect", (ev, site) => {
    connectUrl = site;
    win.loadURL(site);
});

electron.ipcMain.on("enable", (ev, i) => {
    let sites = electronSettings.get("sites", []);
    const site = sites[i];
    console.log(`Enabling ${site.title}...`);
    const parsedUrl = url.parse(site.url);
    const proxy = httpProxy.createProxyServer({
        "target": url.format({
            "hostname": parsedUrl.hostname,
            "port": parsedUrl.port,
            "protocol": parsedUrl.protocol
        }),
        "secure": false
    });
    proxy.on("proxyReq", (proxyReq, req, res, opts) => {
        proxyReq.setHeader("Cookie", site.cookies);
        proxyReq.setHeader("Host", parsedUrl.hostname);
    });
    const server = http.createServer((req, res) => {
        proxy.web(req, res);
    });
    const tryListen = tryNum => {
        const port = 49152 + Math.floor(16384 * Math.random());
        server.listen(port, "localhost", err => {
            if (err) {
                if (tryNum >= 10) {
                    server.close();
                    console.error("Unable to bind server");
                } else {
                    tryListen(tryNum + 1);
                }
            } else {
                site.mount = true;
                electronSettings.set("sites", sites);
                servers[site.id] = server;
                console.log(`dav://localhost:${port}${parsedUrl.path}`);
            }
        });
    };
    tryListen(0);
});

electron.ipcMain.on("disable", (ev, i) => {
    let sites = electronSettings.get("sites", []);
    const site = sites[i];
    console.log(`Disabling ${site.title}...`);
    servers[site.id].close();
    servers[site.id] = null;
    site.mount = null;
    electronSettings.set("sites", sites);
});

electron.app.on("ready", () => {
    let sites = electronSettings.get("sites", []);
    for (var i = 0; i < sites.length; ++i) {
        sites[i].mount = null;
    }
    electronSettings.set("sites", sites);
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
