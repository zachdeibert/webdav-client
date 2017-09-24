const electron = require("electron");
const electronSettings = require("electron-settings");
const http = require("http");
const httpProxy = require("http-proxy");
const url = require("url");
let platform;

switch (process.platform) {
    case "linux":
        platform = require("./platform/linux");
        break;
    case "win32":
        platform = require("./platform/windows");
        break;
    default:
        platform = require("./platform/dummy");
        break;
}

let proxyServers = {};
const proxy = httpProxy.createProxyServer({
    "secure": false
});

proxy.on("proxyReq", (proxyReq, req, res, opts) => {
    const host = url.parse(req.site.url).hostname;
    proxyReq.setHeader("Host", host);
    proxyReq.setHeader("Cookie", req.cookies);
});

function doMount(site) {
    const parsedUrl = url.parse(site.url);
    let server;
    const doConnect = () => platform.mount(`dav://localhost:${server.address().port}${parsedUrl.pathname}`);
    if (proxyServers[parsedUrl.hostname]) {
        server = proxyServers[parsedUrl.hostname];
        server.allowedPaths.push(parsedUrl.pathname);
        doConnect();
    } else {
        server = proxyServers[parsedUrl.hostname] = http.createServer((req, res) => {
            const parsedUrl2 = url.parse(req.url);
            let isValid = false;
            for (var i = 0; i < server.allowedPaths.length; ++i) {
                if (parsedUrl2.pathname.startsWith(server.allowedPaths[i])) {
                    isValid = true;
                    break;
                }
            }
            if (isValid) {
                electron.session.defaultSession.cookies.get({
                    "url": site.url
                }, (err, cookies) => {
                    if (err) {
                        console.error(err);
                    } else {
                        req.cookies = cookies.map(c => `${c.name}=${c.value}`).join("; ");
                    }
                    req.site = site;
                    proxy.web(req, res, {
                        "target": url.format({
                            "hostname": parsedUrl.hostname,
                            "protocol": parsedUrl.protocol
                        })
                    });
                });
            } else {
                res.end();
            }
        });
        const closeHandler = () => server.close();
        electron.app.on("close", closeHandler);
        server.on("close", () => {
            proxyServers[parsedUrl.hostname] = null;
            electron.app.removeListener("close", closeHandler);
        });
        server.allowedPaths = [
            parsedUrl.pathname
        ];
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
                    doConnect();
                }
            });
        };
        tryListen(0);
    }
}

function doUnmount(site) {
    const parsedUrl = url.parse(site.url);
    if (proxyServers[parsedUrl.hostname]) {
        platform.unmount(`dav://localhost:${proxyServers[parsedUrl.hostname].address().port}${parsedUrl.pathname}`);
        proxyServers[parsedUrl.hostname].allowedPaths.splice(proxyServers[parsedUrl.hostname].allowedPaths.indexOf(parsedUrl.pathname), 1);
        if (proxyServers[parsedUrl.hostname].allowedPaths.length == 0) {
            proxyServers[parsedUrl.hostname].close();
        }
    } else {
        console.error(`Unknown site '${site.id}'`);
    }
}

electron.ipcMain.on("mount", (ev, id) => {
    let sites = electronSettings.get("sites", []);
    let site = null;
    for (var i = 0; i < sites.length; ++i) {
        if (sites[i].id == id) {
            site = sites[i];
            break;
        }
    }
    if (site === null) {
        console.error(`Unknown site '${id}'`);
    } else if (site.mount !== false) {
        console.error(`Site '${site.id}' is already mounted`);
    } else {
        console.log(`Mouting site ${site.title}...`);
        site.mount = true;
        doMount(site);
        electronSettings.set("sites", sites);
        electron.ipcMain.emit("update");
    }
});

electron.ipcMain.on("unmount", (ev, id) => {
    let sites = electronSettings.get("sites", []);
    let site = null;
    for (var i = 0; i < sites.length; ++i) {
        if (sites[i].id == id) {
            site = sites[i];
            break;
        }
    }
    if (site === null) {
        console.error(`Unknown site '${id}'`);
    } else if (site.mount === false) {
        console.error(`Site '${site.id}' is not mounted`);
    } else {
        console.log(`Unmouting site ${site.title}...`);
        site.mount = false;
        doUnmount(site);
        electronSettings.set("sites", sites);
        electron.ipcMain.emit("update");
    }
});

electron.app.on("ready", () => {
    const sites = electronSettings.get("sites", []);
    for (var i = 0; i < sites.length; ++i) {
        if (sites[i].mount !== false) {
            console.log(`Automouting site ${sites[i].title}...`);
            doMount(sites[i]);
        }
    }
});

exports.quit = () => {
    const sites = electronSettings.get("sites", []);
    for (var i = 0; i < sites.length; ++i) {
        if (sites[i].mount !== false) {
            doUnmount(sites[i]);
        }
    }
};
