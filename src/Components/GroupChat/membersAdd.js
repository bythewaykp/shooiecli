module.exports = addGrp = async (client, msg, t, gspread) => {
  let chat = await require("../Templates/basicCheckGroupChat")(client, msg);
  // const chat = await msg.getChat()

  let from = msg.author || msg.from;
  let sender = await client.getContactById(from);

  if (chat) {
    console.log(
      `${t["main"]} called at Group : '${chat.name}' by ${
        sender.name || sender.pushname
      } aka ${sender.number}`
    );
    await msg.react("⚡");

    if (t["url"] != undefined) {
      console.log("\n --- url found ---\n");

      let doc = await gspread(t["url"]);
      // console.log(t['url']);
      let sheet = doc.sheetsByIndex[0];
      await sheet.loadCells("A1:C100");

      let end = 6;

      for (let i = 1; i < end; i++) {
        try {
          console.log(
            `${sheet.getCell(i, 0).value} aka ${
              sheet.getCell(i, 1).value
            } was added`
          );
          await chat.addParticipants([`${sheet.getCell(i, 1).value}@c.us`]);
        } catch (e) {
          console.log(
            `${sheet.getCell(i, 0).value} aka ${
              sheet.getCell(i, 1).value
            } error`
          );
        }
      }
    } else if (t["num"] != undefined) {
      let numlist = t["num"].split("\n");
      for (let i of numlist) {
        try {
          await chat.addParticipants([`${i}@c.us`]);
        } catch (e) {
          console.log(`error adding ${i}`);
        }
      }
    }
  }

  // const arr = await csvread('../Files/add.csv')

  // const chat = await msg.getChat();

  // console.log(`${chat.name} triggered!`);

  // const list1=[]
  // var k =""
  // arr.forEach((x,i)=>{
  //     if(i){
  //         k = x[3]
  //         list2.push(`91${k.substring(k.length - 10)}@c.us`)
  //     }
  // })
  // // console.log(list2,chat);

  // try {
  //     await chat.addParticipants(list1);

  // } catch (err) {
  //     console.log(err);
  // }
};
