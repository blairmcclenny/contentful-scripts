const fs = require("fs")
const csv = require("csv-parser")
const contentfulManagement = require("contentful-management")

require("dotenv").config()

const client = contentfulManagement.createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
})

const spaceId = process.env.CONTENTFUL_SPACE_ID
const environmentId = process.env.CONTENTFUL_ENVIRONMENT_ID

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function createEntry(title, summary) {
  if (typeof title !== "string" || title.trim() === "") {
    console.error("Invalid title")
    return
  }

  if (typeof summary !== "string" || summary.trim() === "") {
    console.error("Invalid summary")
    return
  }

  try {
    const space = await client.getSpace(spaceId)
    const environment = await space.getEnvironment(environmentId)

    const entry = await environment.createEntry("recipeTag", {
      fields: {
        title: {
          "en-US": title,
        },
        summary: {
          "en-US": summary,
        },
      },
    })

    console.log(`Entry created: ${entry.sys.id}`)
  } catch (error) {
    console.error(`Error creating entry: ${error}`)
  }
}

async function processCSV(filePath) {
  const entries = []

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      if (row.Tag && row.Description) {
        entries.push({ title: row.Tag, summary: row.Description })
      }
    })
    .on("end", async () => {
      console.log("CSV file successfully processed")
      for (const entry of entries) {
        await createEntry(entry.title, entry.summary)
        await delay(1000)
      }
    })
}

processCSV(process.env.CSV_FILE_PATH_RECIPE_TAGS)
