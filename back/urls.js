const electron = require("electron");
const http = require("http");
const npm = require("npm");
const path = require("path");
const url = require("url");

let baseUrl = null;

exports.loadURL = (win, relativeUrl) => {
    if (baseUrl === null) {
        let isDev = false;
        for (var i = 0; i < process.argv.length; ++i) {
            if (process.argv[i] == "--dev") {
                isDev = true;
                break;
            }
        }
        if (isDev) {
            process.env.BROWSER = "none";
            npm.load({
                "prefix": path.join(__dirname, ".."),
                "loglevel": "verbose"
            }, (err, cfg) => {
                if (err) {
                    console.log(err);
                } else {
                    npm.commands["run-script"]([
                        "dev"
                    ], (err, a) => {
                        if (err) {
                            console.error(err);
                        }
                    });
                }
            });
            baseUrl = "http://localhost:3000/#";
            const loop = () => {
                console.log("Attempting to connect to development server...");
                http.get({
                    "protocol": "http:",
                    "hostname": "localhost",
                    "port": 3000,
                    "timeout": 1000
                }, () => {
                    console.log("Connected to development server.");
                    win.loadURL(baseUrl + relativeUrl);
                }).once("error", () => {
                    console.log("Unable to connect to development server.");
                    setTimeout(loop, 1000);
                });
            };
            setTimeout(loop);
            win.setSize(1920, 1080);
            win.toggleDevTools();
        } else {
            baseUrl = `${url.format({
                "pathname": path.join(__dirname, "..", "build", "index.html"),
                "protocol": "file:",
                "slashes": true
            })}#`;
            win.loadURL(baseUrl + relativeUrl);
        }
    } else {
        win.loadURL(baseUrl + relativeUrl);
    }
};
