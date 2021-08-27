import "./lifecycle.ts";

const handler = (e: Event): void => {
    console.log(`got ${e.type} event in event handler (main)`);
};

window.addEventListener("load", handler);

window.addEventListener("unload", handler);

window.onload = (e: Event): void => {
    console.log(`got ${e.type} event in onload function (main)`);
};

window.onunload = (e: Event): void => {
    console.log(`got ${e.type} event in onunload function (main)`);
};

console.log("log from main script");