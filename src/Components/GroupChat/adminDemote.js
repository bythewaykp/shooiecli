module.exports = async (client, msg) => {
  let chat = await require("../Templates/basicCheckGroupChat")(client, msg);
  let isadmin = require("../Templates/adminCheck");
  // const chat = await msg.getChat()

  let from = msg.author || msg.from;
  let sender = await client.getContactById(from);

  if (chat) {
    console.log(
      `.d called at Group : '${chat.name}' by ${
        sender.name || sender.pushname
      } aka ${sender.number}`
    );
    await msg.react("⚡");

    console.log(
      `.d called at Group : '${chat.name}' by ${sender.name} aka ${sender.number}`
    );

    if (msg.hasQuotedMsg) {
      //has quoted message
      let og = await msg.getQuotedMessage();
      let ogAuth = og.author || og.from;

      for (let p of chat.participants) {
        if (p.id._serialized == ogAuth) {
          let mentions = [];
          mentions.push(await client.getContactById(p.id._serialized));
          mentions.push(await client.getContactById(from));

          if (!p.isAdmin) {
            msg.reply("alredi not admin vro");
          } else {
            await chat.demoteParticipants([ogAuth]);
            msg.reply(`demoted @${p.id.user} by @${from.split("@")[0]}`, null, {
              mentions,
            });
          }
        }
      }
    } else {
      let mentions = await msg.getMentions();

      let toDemote = [];
      let toDemoteText = [];
      let alreadyDemotedText = [];

      if (mentions.length == 0) {
        //no mentions present in quoted message
        msg.reply(
          "atleast one member should be mentioned or tagged to promote"
        );
      } else {
        //mentions are present in quoted message

        for (let i of mentions) {
          if (isadmin(i.id._serialized, chat)) {
            toDemote.push(i.id._serialized);
            toDemoteText.push(`@${i.id.user}`);
          } else {
            alreadyDemotedText.push(`@${i.id.user}`);
          }
        }

        // for(let p of chat.participants){

        //     for ( let i of mentions){
        //         if(i.id._serialized == p.id._serialized){

        //             if(!p.isAdmin){
        //                 alreadyDemotedText.push( `@${p.id.user}`)
        //             }
        //             else{
        //                 toDemote.push(p.id._serialized)
        //                 toDemoteText.push( `@${p.id.user}`)
        //             }

        //         }
        //     }
        // }

        mentions.push(await client.getContactById(from));

        if (toDemoteText.length == 0) {
          msg.reply(`Members mentioned are already not admins`);
        } else {
          await chat.demoteParticipants(toDemote);

          await msg.reply(
            `demoted ${toDemoteText.join(", ")} by @${from.split("@")[0]} ${
              alreadyDemotedText.length == 0
                ? ``
                : `~ ${
                    alreadyDemotedText.length == 1
                      ? `${alreadyDemotedText[0]} is already not an admin`
                      : `${alreadyDemotedText.join(
                          ", "
                        )} are already not admins`
                  }`
            }`,
            null,
            { mentions }
          );

          // }
        }
      }
    }
  }
};
