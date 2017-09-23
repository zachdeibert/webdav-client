const child_process = require("child_process");
const electron = require("electron");
const http = require("http");
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
            let env = {};
            const keys = Object.getOwnPropertyNames(process.env);
            for (var i = 0; i < keys.length; ++i) {
                env[keys[i]] = process.env[keys[i]];
            }
            env.BROWSER = "none";
            const proc = child_process.spawn("npm", [
                "run",
                "dev"
            ], {
                "cwd": path.join(__dirname, ".."),
                "stdio": "inherit",
                "env": env
            });
            electron.app.on("quit", () => proc.kill());
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
                    setTimeout(loop, 100);
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
