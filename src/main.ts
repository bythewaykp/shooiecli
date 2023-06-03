import { DriveClient } from "./gdriveClass.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

let { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const delay = (ms) => new Promise((res) => setTimeout(res, ms));
let qrcode = require("qrcode-terminal");

let headless = false;
// let headless = true;
let sessionExist = false;

let drive = new DriveClient({
    // fileName: "userSession.tar.gz",
    // folderName: ".shooieDataFiles3",
    // zipName: "./userSession.tar.gz",
});

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

try {
    if (!drive.folderExists("Session/session-shooie")) {
        // NO  SESSION FOUND
        console.log(
            "No sessions found. trying to load data form remote session"
        );
        let fileId = await drive.getFileStatus();
        if (!fileId) {
            console.log("No archives found. Please scan the qr code");
        } else {
            await drive.downloadFile();
            await drive.extract();
            drive.removeZip();
        }
    } else {
        console.log("session exist. Loading data form local session");

        sessionExist = true;
    }

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

        setInterval(async () => {
            await drive.createDirCopy();
            await drive.deleteMetadata();
            await drive.compress();

            drive.removeDirCopy();

            if (await drive.getFileStatus()) {
                await drive.updateFileToFolder();
            } else {
                await drive.uploadFileToFolder();
            }
            drive.removeZip();
            
        }, 60000);
    });

    client.on("qr", (qr) => {
        if (headless) {
            qrcode.generate(qr, { small: true });
        }
    });
    client.on("auth_failure", () => {
        console.log(
            "\n --- Authentication failed. scan the qr code to login again. --- \n"
        );
    });

    client.on("disconnected", async () => {
        console.log("client disconnected");
    });

    client.on("message_create", async (msg) => {
        // clearCache();
        // await require("./caller.js")(client, msg, MessageMedia, vars, changeVars);
    });

    if (sessionExist) {
        drive.getFileStatus();
    }

    client.initialize();
} catch (e) {
    console.log("main error occured");

    console.log(e);
}
