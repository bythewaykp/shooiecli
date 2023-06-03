module.exports = async (client, msg) => {
  let chat = await require("../Templates/basicCheckGroupChat")(client, msg);
  // const chat = await msg.getChat()

  let from = msg.author || msg.from;
  let sender = await client.getContactById(from);

  if (chat) {
    console.log(
      `.p called at Group : '${chat.name}' by ${
        sender.name || sender.pushname
      } aka ${sender.number}`
    );
    await msg.react("⚡");

    let commandAuthor = await client.getContactById(from);

    console.log(
      `.a called at Group : '${chat.name}' by ${
        commandAuthor.name || commandAuthor.pushname
      } aka ${commandAuthor.number}`
    );

    if (msg.hasQuotedMsg) {
      let og = await msg.getQuotedMessage();
      let ogAuth = og.author || og.from;

      for (let p of chat.participants) {
        if (p.id._serialized == ogAuth) {
          let mentions = [];
          mentions.push(await client.getContactById(p.id._serialized));
          mentions.push(await client.getContactById(from));

          if (p.isAdmin) {
            msg.reply("alredi admin vro");
          } else {
            await chat.promoteParticipants([ogAuth]);
            msg.reply(
              `promoted @${p.id.user} by @${from.split("@")[0]}`,
              null,
              { mentions }
            );
          }
        }
      }
    } else {
      let mentions = await msg.getMentions();

      let toAdmin = [];
      let toAdminText = [];
      let alreadyAdminText = [];

      if (mentions.length == 0) {
        msg.reply(
          "atleast one member should be mentioned or tagged to promote"
        );
      } else {
        for (let p of chat.participants) {
          for (let i of mentions) {
            if (i.id._serialized == p.id._serialized) {
              if (p.isAdmin) {
                alreadyAdminText.push(`@${p.id.user}`);
              } else {
                toAdmin.push(p.id._serialized);
                toAdminText.push(`@${p.id.user}`);
              }
            }
          }
        }

        mentions.push(await client.getContactById(from));

        if (toAdminText.length == 0) {
          msg.reply(`Members mentioned are already admins`);
        } else {
          await chat.promoteParticipants(toAdmin);

          if (alreadyAdminText.length == 0) {
            msg.reply(
              `promoted ${toAdminText.join(", ")} by @${from.split("@")[0]}`,
              null,
              { mentions }
            );
          } else if (alreadyAdminText.length == 1) {
            msg.reply(
              `promoted ${toAdminText.join(", ")} by @${
                from.split("@")[0]
              } ~ ${alreadyAdminText.join(", ")} is already an admin`,
              null,
              { mentions }
            );
          } else {
            msg.reply(
              `promoted ${toAdminText.join(", ")} by @${
                from.split("@")[0]
              } ~ ${alreadyAdminText.join(", ")} are already admins`,
              null,
              { mentions }
            );
          }
        }
      }
    }
  }
};
