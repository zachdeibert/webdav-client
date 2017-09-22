var electron = require("electron");
var electronSettings = require("electron-settings");

function deleteSite(i) {
    var sites = electronSettings.get("sites", []);
    sites.splice(i, 1);
    electronSettings.set("sites", sites);
    location.reload();
}

function changeStatus(i) {
    var element = document.getElementById("switch-" + i);
    if (element.checked) {
        electron.ipcRenderer.send("enable", i);
    } else {
        electron.ipcRenderer.send("disable", i);
    }
}

function printSites() {
    var sites = electronSettings.get("sites", []);
    for (var i = 0; i < sites.length; ++i) {
        document.write(
            "<div class='card'>",
                "<div class='card-image'>",
                    "<img src='", sites[i].icon, "' />",
                    "<span class='card-title'>",
                        sites[i].title,
                    "</span>",
                "</div>",
                "<div class='card-content'>",
                    "<p>",
                        sites[i].url,
                    "</p>",
                    "<div class='switch'>",
                        "<label>",
                            "Off",
                            "<input type='checkbox' id='switch-", i, "' onchange='changeStatus(", i, ")'", (sites[i].mount === null ? "" : " checked"), " />",
                            "<span class='lever'></span>",
                            "On",
                        "</label>",
                    "</div>",
                "</div>",
                "<div class='btn-floating btn-small red close-btn' onclick='deleteSite(", i, ")'>",
                    "<i class='material-icons'>",
                        "close",
                    "</i>",
                "</div>",
            "</div>"
        );
    }
}
