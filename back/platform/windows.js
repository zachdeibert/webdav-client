const child_process = require("child_process");
const fs = require("fs");

let mountedLetters = {};

exports.mount = (url, letter) => {
    child_process.spawn("net", [
        "use",
        letter,
        url.replace("dav://", "http://"),
        "/P:Yes"
    ]);
    mountedLetters[url] = letter;
};

exports.unmount = (url) => {
    const letter = mountedLetters[url];
    if (letter) {
        child_process.spawn("net", [
            "use",
            letter,
            "/delete"
        ]);
    } else {
        console.error(`Unknown url '${url}'`);
    }
};
