import { DriveClient } from "./gdriveClass.js";

let drive = new DriveClient({
    // fileName: "userSession.tar.gz",
    // folderName: ".shooieDataFiles3",
    // zipName: "./userSession.tar.gz",
});

// await drive.createDirCopy();
// await drive.deleteMetadata();
// await drive.compress();
await drive.downloadFile();
await drive.extract();

//     drive.removeDirCopy();

//     if (await drive.getFileStatus()) {
//         await drive.updateFileToFolder();
//     } else {
//         await drive.uploadFileToFolder();
//     }
//     drive.removeZip();
