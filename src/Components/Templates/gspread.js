const gspread = async (url) => {
  const { GoogleSpreadsheet } = require("google-spreadsheet");
  const creds = require("./creds.json");
  const doc = new GoogleSpreadsheet(url.split("/")[5]);
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();

  // console.log(doc.title);
  // const rows = await sheet.getRows()
  // console.log(rows[0].Name)
  // let sheet = doc.sheetsByIndex[0]
  // await sheet.loadCells('A1:C100');
  // console.log(sheet.getCell(1, 2).value);

  // await rows[1].save(); // save updates
  // await rows[1].delete();

  return doc;
};

// gspread("https://docs.google.com/spreadsheets/d/12qwnZTnTb7_ljf5quQZU4QAZmxQR3qkS3l-4Z7DTJOg/edit?usp=sharing")

module.exports = gspread;
