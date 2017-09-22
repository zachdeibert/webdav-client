var electron = require("electron");

function connect() {
    electron.ipcRenderer.send("connect", document.getElementById("url").value);
    return false;
}
