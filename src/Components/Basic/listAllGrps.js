const fs = require("fs");
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const listgrps = async (client, msg) => {
  //!l -p 1
  if (t["p"] != undefined && t["p"] == 1) {
    let k = [];
    console.log("\n --- Send grplist WA ---\n");
    console.log(msg.from);
    const groups = (await client.getChats()).filter((c) => c.isGroup);

    for (let i = 0; i < groups.length; i++) {
      var id = groups[i].id._serialized;
      var name = (await client.getChatById(id)).name;
      k.push(`${i + 1}. ${name} - ${id}`);
    }
    client.sendMessage(msg.from, k.join("\n"));

    console.log("\n --- End ---\n");
  } else {
    console.log("\n --- List All Grps ---\n");

    const groups = (await client.getChats()).filter((c) => c.isGroup);

    for (let i = 0; i < groups.length; i++) {
      var id = groups[i].id._serialized;
      var name = (await client.getChatById(id)).name;
      console.log(`${i + 1}. ${name} - ${id}`);

      // fs.appendFileSync("./Files/grpList.csv", `${i + 1},${name},${id}\n`);
    }
    console.log("\n --- End ---\n");

    delay(1000);
  }
};

module.exports = listgrps;
