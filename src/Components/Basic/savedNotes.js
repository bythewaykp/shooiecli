let axios = require("axios");

module.exports = async (client, msg, t) => {
  await msg.react("⚡");

  const chat = await msg.getChat();

  let db = await axios.get("http://localhost:3000/notes").then((r) => {
    return r.data;
  });
  let match = false;

  for (let i of db) {
    if (i.id == chat.id._serialized) {
      match = true;

      if (t["a"]) {
        let b = t["a"].split("\n");

        await axios
          .patch(`http://localhost:3000/notes/${chat.id._serialized}`, {
            id: chat.id._serialized,
            data: {
              ...i.data,
              [b[0]]: b[1],
            },
          })
          .then(async (r) => {
            await msg.reply(`added ${b[0]} to the list of saved notes`);
          })
          .catch((e) => {
            console.log("error");
          });
      } else if (t["s"]) {
        await msg.reply(i.data[t["s"]]);
      } else if (t["d"]) {
        let newdata = i.data;
        if (Object.keys(newdata).length == 1) {
          await axios
            .delete(`http://localhost:3000/notes/${chat.id._serialized}`)
            .then(async (r) => {
              await msg.reply(`deleted ${t["d"]} from list of saved notes`);
            })
            .catch((e) => {
              console.log("error");
            });
        } else {
          delete newdata[t["d"]];

          await axios
            .patch(`http://localhost:3000/notes/${chat.id._serialized}`, {
              id: chat.id._serialized,
              data: {
                ...newdata,
              },
            })
            .then(async (r) => {
              await msg.reply(`deleted ${t["d"]} from list of saved notes`);
            })
            .catch((e) => {
              console.log("error");
            });
        }
      } else {
        await msg.reply(
          `_saved notes in group : '${chat.name}_'

${Object.keys(i.data).join("\n")}`
        );
      }

      break;
    }
  }
  if (!match) {
    if (t["a"]) {
      let b = t["a"].split("\n");

      await axios
        .post(`http://localhost:3000/notes`, {
          id: chat.id._serialized,
          data: {
            [b[0]]: b[1],
          },
        })
        .then(async (r) => {
          await msg.reply(`added ${b[0]} to the list of saved notes`);
        })
        .catch((e) => {
          console.log("error");
        });
    } else {
      await msg.reply(`_no notes saved in group : '${chat.name}_'`);
    }
  }
};
