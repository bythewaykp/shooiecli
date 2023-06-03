module.exports = addGrp = async (client, msg) => {
  let chat = await require("../Templates/basicCheckGroupChat")(client, msg);
  // const chat = await msg.getChat()

  let from = msg.author || msg.from;
  let sender = await client.getContactById(from);

  if (chat) {
    console.log(
      `.r called at Group : '${chat.name}' by ${
        sender.name || sender.pushname
      } aka ${sender.number}`
    );
    await msg.react("⚡");

    let mentions = await msg.getMentions();

    let namelist = [];
    let removelist = [];

    for (let i of mentions) {
      let id = i.id._serialized;
      let sender = await client.getContactById(id);
      namelist.push(sender.name);
      removelist.push(id);
    }

    try {
      await chat.removeParticipants(removelist);
      await msg.reply(`${removelist.map((i) => {})}`);
      console.log(`removed ${namelist.join(", ")} from ${chat.name}`);
    } catch (e) {
      console.log(
        `error occured while removing ${namelist.join(", ")} from ${chat.name}`
      );
    }
  }
};
