module.exports = async (client, msg, MessageMedia, vars, changeVars) => {
  try {
    let v = String(msg.body).split(" ")[0];
    let t = String(msg.body).split(" ").splice(1).join(" ");

    if (vars.all) {
      switch (v) {
        case ".t":
          await require("./Components/Features/test")(
            client,
            msg,
            t,
            MessageMedia
          );
          break;

        case ".h":
          await require("./Components/Basic/help")(client, msg);
          break;

        case ".m":
          await require("./Components/GroupChat/mentionParticipants")(
            client,
            msg,
            t
          );
          break;

        case ".p":
          await require("./Components/GroupChat/adminPromote")(client, msg);
          break;

        case ".d":
          await require("./Components/GroupChat/adminDemote")(client, msg);
          break;

        case ".a":
          let gspread = require("./Components/Templates/gspread");
          await require("./Components/GroupChat/membersAdd")(
            client,
            msg,
            t,
            gspread
          );
          break;

        case ".r":
          await require("./Components/GroupChat/membersRemove")(client, msg);
          break;

        case ".y":
          await require("./Components/Features/ytDownload")(
            client,
            msg,
            t,
            MessageMedia
          );
          break;

        case ".v":
          await require("./Components/Basic/editVariables")(
            client,
            msg,
            t,
            vars,
            changeVars
          );
          break;

        case ".z":
          await require("./Components/GroupChat/sendGrpMessageMembers")(
            client,
            msg,
            t
          );
          break;

        case ".s":
          await require("./Components/Features/sticker")(client, msg, t);
          break;

        case ".run":
          await require("./Components/Basic/reRun")(
            client,
            msg,
            MessageMedia,
            vars,
            changeVars
          );
          break;

        // case ".e":
        //     await require("./Components/Features/destroy")(client,msg,t);
        //     break;
      }

      if (msg.fromMe) {
        //message sent by owner

        switch (v) {
          case ".l":
            await require("./Components/Basic/listAllGrps")(client, msg);
            break;

          case ".b":
            await require("./Components/Basic/sendBulk")(
              client,
              msg,
              MessageMedia
            );
            break;
        }
      }
    } else {
      // msg not fromMe && turned off

      if (v == ".v") {
        await require("./Components/Basic/editVariables")(
          client,
          msg,
          t,
          vars,
          changeVars
        );
      } else {
        //                     mentions = [await client.getContactById(client.info.wid._serialized)]
        //                     await msg.reply(
        // `_nippi_ is turned off for everyone use
        // contact @${client.info.wid.user}`,null,{mentions}
        //                     )
      }
    }
  } catch (e) {
    console.log(e);
  }
};
