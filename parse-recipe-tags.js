const fs = require("fs")
const csv = require("csv-parser")

require("dotenv").config()

function getUniqueTagsFromCSV(filePath) {
  const tagsSet = new Set()

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      if (row.Tags) {
        const tags = row.Tags.split(",")
        tags.forEach((tag) => tagsSet.add(tag.trim()))
      }
    })
    .on("end", () => {
      const uniqueTags = Array.from(tagsSet)
      console.log(uniqueTags)
    })
}

getUniqueTagsFromCSV(process.env.CSV_FILE_PATH)
