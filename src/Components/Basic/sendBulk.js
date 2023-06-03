const delay = (ms) => new Promise((res) => setTimeout(res, ms));

module.exports = sendBulk = async (client, msg, MessageMedia) => {
    let chat = await msg.getChat();
    let from = msg.author || msg.from;
    let sender = await client.getContactById(from);
    console.log(
        `.b called at Group : '${chat.name}' by ${
            sender.name || sender.pushname
        } aka ${sender.number}`
    );

    let name;
    let num;

    let mentions = [await client.getContactById("919847532916@c.us")];

    console.log("\n --- Triggered ---\n");

    const csvread = require("../Templates/csvread");
    const arr = await csvread("Files/a.csv");

    const media1 = MessageMedia.fromFilePath("Files/a.png");

    for (let i = 1; i < arr.length; i++) {
        // await delay((Math.random() + 1) * 1000)

        name = arr[i][0].split(" ")[0];
        num = arr[i][1].replace(/\s/g, "").slice(-10);

        try {
            //             await client.sendMessage(`91${num}@c.us`, media1, {
            //                 caption: `Dear ${name},

            // This is to remind you that you *haven't completed* the payment of *INR 280* for NSS T-shirt.
            // The order for your T-shirt, if payment is not done at the *earliest by today*, will stand cancelled.

            // Also if you havent't filled *all of the below*, do ASAP.

            // Form for choosing T-shirt size :
            // _https://forms.gle/kR5baj4XPDWPtc7s8_

            // Form for Cap :
            // _https://forms.gle/hY4pQyNELQNfr7Wt9_

            // After completing the payment update the sheet :
            // _https://docs.google.com/spreadsheets/d/1oi07EtXLoEl_m29J_luff6Td3OZiK4OpK1kWg3w97j0/edit?usp=drivesdk_

            // Contact @919847532916 if you have any queries.`,
            //                 mentions,
            //             });

            await client.sendMessage(`91${num}@c.us`, media1, {
                caption: `Dear ${name},

This is a sample text message.

Contact @919847532916 if you have any queries.`,
                mentions,
            });

            // arr[i][5] = 'message sent'
            console.log(`${i}/${arr.length - 1} --- ${name}`);
            // fs.appendFileSync('./Files/b21-succ.csv', `${i},${arr[i][0]},${arr[i][1]}\n`)
        } catch (err) {
            console.log(`${i}/${arr.length - 1} --- ${name} - error`);
            // fs.appendFileSync('./Files/b21-err.csv', `${i},${arr[i][0]},${arr[i][1]}\n`)
        }
    }
};
