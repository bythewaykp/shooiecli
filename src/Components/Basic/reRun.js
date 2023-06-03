module.exports = async (client, msg, MessageMedia, vars, changeVars) => {
  let adminvars = [".h", ".s", ".y"];

  await msg.react("⚡");
  let from = msg.author || msg.from;
  const chat = await msg.getChat();

  if (msg.hasQuotedMsg) {
    let og = await msg.getQuotedMessage();
    console.log(`running ${og.body}`);

    if (chat.isGroup) {
      let isadmin = require("../Templates/adminCheck");

      let v = String(og.body).split(" ")[0];

      if (adminvars.includes(v) || isadmin(from, chat)) {
        //bot is admin
        await require("../../caller")(
          client,
          og,
          MessageMedia,
          vars,
          changeVars
        );
      } else {
        await msg.reply(`_You must be an admin to re-run authorized commands_`);
        //bot is not admin
      }
    } else {
      await require("../../caller")(client, og, MessageMedia, vars, changeVars);
    }
  } else {
    await msg.reply(`_A message should be quoted to run this command_`);
  }
};
