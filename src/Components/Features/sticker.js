module.exports = async (client, msg, t) => {
  await msg.react("⚡");

  let chat = await msg.getChat();
  let from = msg.author || msg.from;
  let sender = await client.getContactById(from);

  if (chat.isGroup) {
    console.log(
      `.s called at Group : '${chat.name}' by ${
        sender.name || sender.pushname
      } aka ${sender.number}`
    );
  } else {
    console.log(
      `.s called by ${sender.name || sender.pushname} aka ${sender.number}`
    );
  }

  let og = msg;

  if (msg.hasQuotedMsg) {
    og = await msg.getQuotedMessage();
  }

  if (og.hasMedia) {
    let media = await og.downloadMedia();

    if (
      media.mimetype &&
      (media.mimetype.includes("image") || media.mimetype.includes("video"))
    ) {
      await msg.reply(media, null, {
        sendMediaAsSticker: true,
        stickerAuthor: t.split(" ")[0]
          ? `${t.split(" ")[0]} with 🤍 nippi`
          : `with 🤍 nippi`,
        stickerName: t.split(" ")[1] ?? "Shuttu & Nippi",
      });
    } else {
      //mimetype not image/video
      await msg.reply("media format not supported yet");
    }
  } else {
    //has no media
    await msg.reply("Message must contain some media to run this command");
  }
};
