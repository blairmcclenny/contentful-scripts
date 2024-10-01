const fs = require("fs")
const csv = require("csv-parser")

require("dotenv").config()

function countRowsInCSV(filePath) {
  let rowCount = 0

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", () => {
      rowCount++
    })
    .on("end", () => {
      console.log(`Total number of rows: ${rowCount}`)
    })
}

countRowsInCSV(process.env.CSV_FILE_PATH)
