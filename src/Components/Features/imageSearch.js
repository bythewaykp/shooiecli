let fs = require("fs");
let https = require("https");
let google = require("googlethis");

module.exports = async (client, msg, t, MessageMedia) => {
  if (t["s"]) {
    await msg.react("⚡");

    const images = await google.image(t["s"], options);
    await download(images[0].url, `./Files/${images[0].id}.jpg`, async () => {
      console.log("downloaded");
      media = MessageMedia.fromFilePath(`./Files/${images[0].id}.jpg`);
      await msg.reply(media);
      console.log("sent");
      fs.unlinkSync(`./Files/${images[0].id}.jpg`);
    });
  }

  // const my_awesome_image = fs.readFileSync('./a.jpg');
  // const reverse = await google.search(my_awesome_image, { ris: true })
  // for(let a of reverse.results){
  //     console.log(a.title);
  // }
};

var download = async function (url, dest, cb) {
  var file = fs.createWriteStream(dest);
  https.get(url, function (response) {
    if ([301, 302].indexOf(response.statusCode) !== -1) {
      body = [];
      download(response.headers.location, dest, cb);
    }
    response.pipe(file);
    file.on("finish", function () {
      file.close(cb);
    });
  });
};

const options = {
  page: 0,
  safe: false, // Safe Search
  parse_ads: true, // If set to true sponsored results will be parsed
  additional_params: {
    // add additional parameters here, see https://moz.com/blog/the-ultimate-guide-to-the-google-search-parameters and https://www.seoquake.com/blog/google-search-param/
    hl: "en",
  },
};
