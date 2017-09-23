const child_process = require("child_process");
const fs = require("fs");

const letters = [
    "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
];
let mountedLetters = {};

exports.mount = (url) => {
    let letter = null, i;
    for (i = 0; i < letters.length; ++i) {
        if (!fs.existsSync(`${letters[i]}:`)) {
            letter = letters[i];
            break;
        }
    }
    if (letter === null) {
        console.error("No drive letters are available");
    } else {
        child_process.spawn("net", [
            "use",
            `${letter}:`,
            url.replace("dav://", "http://"),
            "/P:Yes"
        ]);
        mountedLetters[url] = letter;
    }
};

exports.unmount = (url) => {
    const letter = mountedLetters[url];
    if (letter) {
        child_process.spawn("net", [
            "use",
            `${letter}:`,
            "/delete"
        ]);
    } else {
        console.error(`Unknown url '${url}'`);
    }
};
