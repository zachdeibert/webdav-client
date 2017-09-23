var faviconElement = document.querySelector("link[rel='shortcut icon']");
var favicon;
if (faviconElement) {
    favicon = faviconElement.href;
} else {
    favicon = location.protocol + "//" + location.hostname + "/favicon.ico";
}

var title;
if (document.title) {
    title = document.title.split("-", 2)[0].trim();
} else {
    title = location.hostname;
}

fetch(favicon).then(res => res.blob()).then(blob => new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(blob);
})).then(icon => [
    title,
    icon
]);
