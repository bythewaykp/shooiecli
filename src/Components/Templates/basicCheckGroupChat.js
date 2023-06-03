module.exports = async (client, msg) => {
  const chat = await msg.getChat();

  if (chat.isGroup) {
    let isadmin = require("../Templates/adminCheck");

    if (isadmin(client.info.wid._serialized, chat)) {
      //bot is admin
      let from = msg.author || msg.from;

      if (isadmin(from, chat)) {
        return chat;
      } else {
        //sender is not an admin
        await msg.reply(`u're not an admin vro`);
        return false;
      }
    } else {
      //bot is not admin
      await msg.reply("Promote me first to use this command");
      return false;
    }
  } else {
    //chat is not a group
    msg.reply("use the command in GroupChat vro");
  }
};
