import { createRequire } from "module";
const require = createRequire(import.meta.url);

import path from "path";
import fs from "fs-extra";

let userDataDir = "./Session/session-shooie";
let tempDir = "./Temp";
let requiredDirs = ["Default", "IndexedDB", "Local Storage"];

let deleteMetadata = async () => {
    const sessionDirs = [tempDir, path.join(tempDir, "Default")];

    for (const dir of sessionDirs) {
        const sessionFiles = await fs.promises.readdir(dir);
        for (const element of sessionFiles) {
            if (!requiredDirs.includes(element)) {
                const dirElement = path.join(dir, element);
                const stats = await fs.promises.lstat(dirElement);

                if (stats.isDirectory()) {
                    await fs.promises
                        .rm(dirElement, {
                            recursive: true,
                            force: true,
                        })
                        .catch(() => {});
                } else {
                    await fs.promises.unlink(dirElement).catch(() => {});
                }
            }
        }
    }
};

let folderExists = (path) => {
    //Remember file access time will slow your program.
    try {
        fs.accessSync(path);
    } catch (err) {
        return false;
    }
    return true;
};

let { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const delay = (ms) => new Promise((res) => setTimeout(res, ms));
let qrcode = require("qrcode-terminal");

let headless;

headless = false;

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

// import { fileURLToPath } from "url";
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
import tar from "tar";
import "dotenv/config.js";
import { google } from "googleapis";
// import path from "path";

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

const drive = google.drive({
    version: "v3",
    auth: oauth2Client,
});

let downloadFile = async (dest) => {
    return new Promise<void>((resolve, reject) => {
        drive.files.get(
            { fileId, alt: "media" },
            { responseType: "stream" },
            (err, { data }) => {
                if (err) {
                    console.log(err);
                    return;
                }
                data.on("end", () => {
                    console.log("Done writing to file.");
                    resolve();
                })
                    .on("error", (err) => {
                        console.log(err);
                        reject();
                        return process.exit();
                    })
                    .pipe(dest);
            }
        );
    });
};

let updateFileToFolder = async (fileId: string) => {
    // const fileMetadata = {
    //     name: fileName,
    //     parents: [folderId],
    // };

    let media = {
        // mimeType: "application/x-tar",
        mimeType: "application/gzip",
        // mimeType: "image/png",
        body: fs.createReadStream(fileName),
    };

    try {
        // console.log("creating file");

        const response = await drive.files.update({
            fileId: fileId,
            // requestBody: fileMetadata,
            media: media,
            fields: "id",
        });
        return response.data.id;
    } catch (error) {
        console.log("The API returned an error:", error);
        return null;
    }
};

let uploadFileToFolder = async (fileName: string, folderId: string) => {
    const fileMetadata = {
        name: fileName,
        parents: [folderId],
    };

    let media = {
        // mimeType: "application/x-tar",
        mimeType: "application/gzip",
        // mimeType: "image/png",
        body: fs.createReadStream(fileName),
    };

    try {
        // console.log("creating file");

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: "id",
        });
        return response.data.id;
    } catch (error) {
        console.log("The API returned an error:", error);
        return null;
    }
};

let createFolder = async (folderName: string) => {
    const fileMetadata = {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
    };
    try {
        const response = await drive.files.create({
            requestBody: fileMetadata,
            fields: "id",
        });
        console.log("successfully created folder");
        return response.data.id;
    } catch (error) {
        console.log("folder couldn't be create");
        console.log("The API returned an error:", error);
        return null;
    }
};

let folderId: string;
let sessionExist = false;
let fileExist = true;
let fileId: string;
let fileName = "userSession.tar.gz";
// let fileName = "a.png";
let folderName = ".shooieDataFiles";

try {
    if (!folderExists("Session/session-shooie")) {
        console.log("No sessions found");

        const res = await drive.files.list({
            q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
            fields: "files(id, name)",
        });

        if (res.data.files.length === 0) {
            console.log("Folder not found.");
            folderId = await createFolder(folderName);
        } else {
            //folder found
            folderId = res.data.files[0].id;
            console.log("folder found");
            console.log("checking for files");

            const fileResponse = await drive.files.list({
                q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
                fields: "files(id)",
            });

            if (fileResponse.data.files.length === 0) {
                console.log("The file does not exist in the folder.");
                fileExist = false;
            } else {
                //file exists in folder
                fileId = fileResponse.data.files[0].id;
                console.log("The file exists in the folder with ID:", fileId);

                var dest = fs.createWriteStream("./userSession.tar.gz"); // Please set the filename of the saved file.
                await downloadFile(dest);
                // await tar.x({
                //     file: "userSession.tar.gz",
                // });

                const extractToDirectory = "./Session/session-shooie";

                fs.mkdirSync(extractToDirectory, { recursive: true });
                await tar.x({
                    file: "userSession.tar.gz",
                    C: extractToDirectory,
                    strip: 1,
                });

                fs.unlink("userSession.tar.gz", function (err) {
                    if (err && err.code == "ENOENT") {
                        // file doens't exist
                        console.info("File doesn't exist, won't remove it.");
                    } else if (err) {
                        // other errors, e.g. maybe we don't have enough permission
                        console.error(
                            "Error occurred while trying to remove file"
                        );
                    } else {
                        console.info(`removed file after download`);
                    }
                });
                console.log("All set for loading wwebjs");
            }
        }
    } else {
        console.log("Session already exists");
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

        await delay(10000);

        console.log("started compressing session");

        await fs.copy(userDataDir, tempDir).catch(() => {});

        await deleteMetadata();

        await tar.c(
            {
                gzip: true,
                file: "userSession.tar.gz",
            },
            ["Temp"]
        );

        fs.rmSync("./Temp", { recursive: true, force: true });

        console.log("done compressing. uploading");

        if (sessionExist) {
            const res = await drive.files.list({
                q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
                fields: "files(id, name)",
            });

            if (res.data.files.length === 0) {
                console.log("Folder not found.");
                folderId = await createFolder(folderName);
                fileId = await uploadFileToFolder(fileName, folderId);

                if (fileId !== null && fileId !== undefined) {
                    console.log("File created with id", fileId);

                    fs.unlink("userSession.tar.gz", function (err) {
                        if (err && err.code == "ENOENT") {
                            // file doens't exist
                            console.info(
                                "File doesn't exist, won't remove it."
                            );
                        } else if (err) {
                            // other errors, e.g. maybe we don't have enough permission
                            console.error(
                                "Error occurred while trying to remove file"
                            );
                        } else {
                            console.info(`removed file after upload`);
                        }
                    });
                } else {
                    console.log("file couldn't be created");
                }
            } else {
                //folder found
                folderId = res.data.files[0].id;
                console.log("folder found");
                console.log("checking for files");

                const fileResponse = await drive.files.list({
                    q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
                    fields: "files(id)",
                });

                if (fileResponse.data.files.length === 0) {
                    console.log("The file does not exist in the folder.");
                    fileId = await uploadFileToFolder(fileName, folderId);

                    if (fileId !== null && fileId !== undefined) {
                        console.log("File created with id", fileId);

                        fs.unlink("userSession.tar.gz", function (err) {
                            if (err && err.code == "ENOENT") {
                                // file doens't exist
                                console.info(
                                    "File doesn't exist, won't remove it."
                                );
                            } else if (err) {
                                // other errors, e.g. maybe we don't have enough permission
                                console.error(
                                    "Error occurred while trying to remove file"
                                );
                            } else {
                                console.info(`removed file after upload`);
                            }
                        });
                    } else {
                        console.log("file couldn't be created");
                    }
                    // fileExist = false;
                } else {
                    fileId = fileResponse.data.files[0].id;
                    console.log(
                        "The file exists in the folder with ID:",
                        fileId
                    );
                    console.log("updating file");

                    fileId = await updateFileToFolder(fileId);
                    if (fileId !== null && fileId !== undefined) {
                        console.log("File updated with id", fileId);

                        fs.unlink("userSession.tar.gz", function (err) {
                            if (err && err.code == "ENOENT") {
                                // file doens't exist
                                console.info(
                                    "File doesn't exist, won't remove it."
                                );
                            } else if (err) {
                                // other errors, e.g. maybe we don't have enough permission
                                console.error(
                                    "Error occurred while trying to remove file"
                                );
                            } else {
                                console.info(`removed file after upload`);
                            }
                        });
                    } else {
                        console.log("file couldn't be created");
                    }
                }
            }
        } else {
            if (fileExist) {
                fileId = await updateFileToFolder(fileId);

                if (fileId !== null && fileId !== undefined) {
                    console.log("File updated with id", fileId);

                    fs.unlink("userSession.tar.gz", function (err) {
                        if (err && err.code == "ENOENT") {
                            // file doens't exist
                            console.info(
                                "File doesn't exist, won't remove it."
                            );
                        } else if (err) {
                            // other errors, e.g. maybe we don't have enough permission
                            console.error(
                                "Error occurred while trying to remove file"
                            );
                        } else {
                            console.info(`removed file after upload`);
                        }
                    });
                } else {
                    console.log("file couldn't be created");
                }
            } else {
                fileId = await uploadFileToFolder(fileName, folderId);
                if (fileId !== null && fileId !== undefined) {
                    console.log("File created with id", fileId);

                    fs.unlink("userSession.tar.gz", function (err) {
                        if (err && err.code == "ENOENT") {
                            // file doens't exist
                            console.info(
                                "File doesn't exist, won't remove it."
                            );
                        } else if (err) {
                            // other errors, e.g. maybe we don't have enough permission
                            console.error(
                                "Error occurred while trying to remove file"
                            );
                        } else {
                            console.info(`removed file after upload`);
                        }
                    });
                } else {
                    console.log("file couldn't be created");
                }
            }
        }

        // if (folderExist == false) {
        //     const res = await drive.files.list({
        //         q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
        //         fields: "files(id, name)",
        //     });

        //     if (res.data.files.length === 0) {
        //         console.log("Folder not found.");
        //         folderId = await createFolder(folderName);
        //     } else {
        //         //folder found
        //         folderId = res.data.files[0].id;
        //         console.log("folder found");
        //     }
        // }
        // if (fileExist) {
        //     fileId = await updateFileToFolder(fileId);
        // } else {
        //     fileId = await uploadFileToFolder(fileName, folderId);
        // }
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
        // clearCache();
        // await require("./caller.js")(client, msg, MessageMedia, vars, changeVars);
    });

    client.initialize();
} catch (e) {
    // throw e;
    console.log("err occured", e);
}
