const delay = (ms) => new Promise((res) => setTimeout(res, ms));

module.exports = async (client, msg, t) => {
  let chat = await msg.getChat();

  if (chat.isGroup) {
    let isadmin = await require("../Templates/adminCheck")(client, msg, t);

    if (isadmin) {
      //is admin

      await msg.react("⚡");

      if (msg.hasQuotedMsg) {
        let og = await msg.getQuotedMessage();

        for (let p of chat.participants) {
          let individualChat = await client.getChatById(p.id._serialized);

          if ((await individualChat.getContact()).isMe) {
            continue;
          }
          console.log(
            `${(await individualChat.getContact()).name} : ${
              individualChat.name
            }`
          );

          if (og.hasMedia) {
            //has media

            let k = await og.downloadMedia();
            console.log("has media");
            await client.sendMessage(p.id._serialized, k, {
              caption: `${og.body}
        
            _~ forwarded from ${chat.name} by ${client.getChatById(from)}_`,
            });
          } else {
            //quoted message has no media

            console.log("no media");
            await client.sendMessage(
              p.id._serialized,
              `${og.body}
                        
            _~ forwarded from group : ${chat.name} by ${client.getChatById(
                from
              )}_`
            );
          }
        }
      }
    } else {
      //not admin
      await msg.reply("not admin vro");
    }
  }
};
