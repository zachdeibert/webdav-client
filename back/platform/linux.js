const child_process = require("child_process");

exports.mount = (url) => {
    child_process.spawn("gvfs-mount", [
        url
    ]);
};

exports.unmount = (url) => {
    child_process.spawn("gvfs-mount", [
        "-u",
        url
    ]);
};
