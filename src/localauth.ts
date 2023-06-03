import { createRequire } from "module";
const require = createRequire(import.meta.url);
let { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
let qrcode = require("qrcode-terminal");

let headless;

headless = false

let vars = {
    all: true,
};
let changeVars = (v) => {
    vars = v;
};

// headless = true;

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "shooie",
        dataPath: "./Session",
    }),
    puppeteer: {
        defaultViewport: null,
        args: [
            "--start-maximized",
            "--disable-session-crashed-bubble",
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ],
        headless,
        executablePath: "/usr/bin/google-chrome-stable",
        // executablePath: "/usr/bin/chromium-browser",
        // executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
    },
});

//clear Module Caches. Recompile every modules each time they are being 'required'
const clearCache = () => {
    Object.keys(require.cache).forEach(function (key) {
        delete require.cache[key];
    });
};

client.on("authenticated", async () => {
    console.log("\n --- Client authenticated ! ---\n");
});

client.on("ready", async () => {
    let sender = await client.getContactById(client.info.wid._serialized);

    console.log(
        `\n --- ${sender.name || sender.pushname} aka ${
            sender.number
        } is ready! ---\n`
    );
});

client.on("qr", (qr) => {
    if (headless) {
        qrcode.generate(qr, { small: true });
    }
});
client.on("auth_failure", (qr) => {
    console.log(
        "\n --- Authentication failed. scan the qr code to login again. --- \n"
    );
});

client.on("disconnected", async () => {
    console.log("client disconnected");
});

client.on("message_create", async (msg) => {
    clearCache();

    await require("./caller")(client, msg, MessageMedia, vars, changeVars);
});

client.initialize();
