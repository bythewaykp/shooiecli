const fs = require("fs");

const csvread = async (path) => {
  const arr = [];
  var i = 0,
    j = 0;

  const cont = fs.readFileSync(path, "utf-8");
  var r = cont.split(/\r?\n/).length;
  var c = cont.split(/\r?\n/)[0].split(",").length;

  for (let i = 0; i < r; i++) {
    arr.push(new Array(c).fill(null));
  }
  cont.split(/\r?\n/).forEach((line) => {
    j = 0;
    line.split(",").forEach((cell) => {
      arr[i][j++] = cell;
    });
    i++;
  });

  return arr;
};
module.exports = csvread;
