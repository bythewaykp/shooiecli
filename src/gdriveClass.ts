// 👇️ named export
import "dotenv/config.js";
import { google } from "googleapis";
import fs from "fs-extra";
import path from "path";
import tar from "tar";

// let userDataDir = "./Session/session-shooie";

interface DriveElems {
    fileName?: string;
    folderName?: string;
    zipName?: string;
}

type NullStr = string | null;

export class DriveClient {
    drive: any;
    folderId: NullStr;
    fileId: NullStr;
    zipName: string;
    fileName: string;
    folderName: string;
    userDataDir: string;
    tempDir: string;

    constructor(options: DriveElems) {
        this.folderId = null;
        this.fileId = null;

        this.fileName = options.fileName || "userSession.tar.gz";
        this.folderName = options.folderName || ".shooieDataFiles";
        this.zipName = options.zipName || "./userSession.tar.gz";
        this.userDataDir = "./Session/session-shooie";
        this.tempDir = "./Temp";

        // this.zipName = "./userSession.tar.gz";
        // this.folderName = ".shooieDataFiles";
        // this.fileName = "userSession.tar.gz";

        let oauth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URI
        );

        oauth2Client.setCredentials({
            refresh_token: process.env.REFRESH_TOKEN,
        });

        const drive = google.drive({
            version: "v3",
            auth: oauth2Client,
        });

        this.drive = drive;
    }

    removeDirCopy() {
        console.log("Removing copy data dir");

        fs.rmSync("./Temp", { recursive: true, force: true });
    }

    async createDirCopy() {
        console.log("making data dir copy");

        await fs.copy(this.userDataDir, this.tempDir).catch(() => {});
    }

    async compress() {
        console.log("started compressing session");

        await tar.c(
            {
                gzip: true,
                file: "userSession.tar.gz",
            },
            [this.tempDir]
        );
    }

    removeZip() {
        fs.unlink(this.fileName, function (err) {
            if (err && err.code == "ENOENT") {
                // file doens't exist
                console.info("File doesn't exist, won't remove it.");
            } else if (err) {
                // other errors, e.g. maybe we don't have enough permission
                console.error("Error occurred while trying to remove file");
            } else {
                console.info(`removed file after download`);
            }
        });
    }

    async extract() {
        fs.mkdirSync(this.userDataDir, { recursive: true });
        await tar.x({
            file: this.fileName,
            C: this.userDataDir,
            strip: 2,
        });
    }

    async deleteMetadata() {
        console.log("Filtering out metadata files");

        let tempDir = "./Temp";
        let requiredDirs = ["Default", "IndexedDB", "Local Storage"];

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
    }

    folderExists(path: string) {
        //Remember file access time will slow your program.
        try {
            fs.accessSync(path);
        } catch (err) {
            return false;
        }
        return true;
    }
    async downloadFile(): Promise<NullStr> {
        let fileId: NullStr;
        if (!this.fileId) {
            fileId = await this.getFileStatus();
            if (!fileId) {
                return null;
            }
        } else {
            fileId = this.fileId;
        }
        console.log("downloading archive");

        let dest = fs.createWriteStream(this.zipName);

        return new Promise<NullStr>((resolve, reject) => {
            this.drive.files.get(
                { fileId, alt: "media" },
                { responseType: "stream" },
                (err, { data }) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    data.on("end", () => {
                        console.log("Finished downloading archive");
                        resolve("done");
                    })
                        .on("error", (err) => {
                            console.log(err);
                            reject(null);
                            return process.exit();
                        })
                        .pipe(dest);
                }
            );
        });
    }
    async createFolder(): Promise<NullStr> {
        if (this.folderId) {
            console.log("folder already exists");
            return null;
        } else {
            const fileMetadata = {
                name: this.folderName,
                mimeType: "application/vnd.google-apps.folder",
            };
            try {
                const res = await this.drive.files.create({
                    requestBody: fileMetadata,
                    fields: "id",
                });
                console.log("successfully created folder");
                this.folderId = res.data.id;
                return res.data.id;
            } catch (error) {
                console.log("folder couldn't be create");
                return null;
            }
        }
    }

    async getFolderStatus(): Promise<NullStr> {
        const res = await this.drive.files.list({
            q: `mimeType='application/vnd.google-apps.folder' and name='${this.folderName}' and trashed=false`,
            fields: "files(id, name)",
        });

        if (res.data.files.length === 0) {
            // console.log("Folder not found.");
            return null;
        } else {
            //folder found
            this.folderId = res.data.files[0].id;
            return res.data.files[0].id;
        }
    }

    async getFileStatus(): Promise<NullStr> {
        let folderId: NullStr;
        if (this.folderId) {
            folderId = this.folderId;
        } else {
            folderId = await this.getFolderStatus();
            if (!folderId) {
                // return null;
                folderId = await this.createFolder();
            }
        }

        const res = await this.drive.files.list({
            q: `name='${this.fileName}' and '${folderId}' in parents and trashed=false`,
            fields: "files(id)",
        });

        if (res.data.files.length === 0) {
            // console.log("The file does not exist in the folder.");
            return null;
        } else {
            this.fileId = res.data.files[0].id;
            console.log("Archive found with id : ", res.data.files[0].id);

            return res.data.files[0].id;
        }
    }

    async updateFileToFolder(): Promise<NullStr> {
        console.log("updating archive on drive");
        let fileId: NullStr;
        if (this.fileId) {
            fileId = this.fileId;
        } else {
            fileId = await this.getFileStatus();
            if (!fileId) {
                return null;
            }
        }
        let media = {
            // mimeType: "application/x-tar",
            mimeType: "application/gzip",
            // mimeType: "image/png",
            body: fs.createReadStream(this.fileName),
        };

        try {
            // console.log("creating file");

            const res = await this.drive.files.update({
                fileId: fileId,
                // requestBody: fileMetadata,
                media: media,
                fields: "id",
            });
            console.log("succefully updated archive with id", res.data.id);
            return res.data.id;
        } catch (error) {
            console.log("The API returned an error:", error);
            return null;
        }
    }

    async uploadFileToFolder() {
        console.log("uplaoding archive to drive");

        let folderId: NullStr;
        if (this.folderId) {
            folderId = this.folderId;
        } else {
            folderId = await this.getFolderStatus();
            if (!folderId) {
                folderId = await this.createFolder();
            }
        }
        const fileMetadata = {
            name: this.fileName,
            parents: [folderId],
        };

        let media = {
            // mimeType: "application/x-tar",
            mimeType: "application/gzip",
            // mimeType: "image/png",
            body: fs.createReadStream(this.fileName),
        };

        try {
            // console.log("creating file");

            const res = await this.drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: "id",
            });
            console.log("succefully uploaded archive with id", res.data.id);

            return res.data.id;
        } catch (error) {
            console.log("The API returned an error:", error);
            return null;
        }
    }
}
