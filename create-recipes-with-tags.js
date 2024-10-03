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

async function getTagId(environment, tagName) {
  try {
    const entries = await environment.getEntries({
      content_type: "recipeTag",
      "fields.title": tagName,
    })
    const tag = entries.items.find(
      (entry) => entry.fields.title["en-US"] === tagName
    )
    return tag ? tag.sys.id : null
  } catch (error) {
    console.error(`Error fetching tags: ${error}`)
    return null
  }
}

async function createEntry(title, tags) {
  try {
    const space = await client.getSpace(spaceId)
    const environment = await space.getEnvironment(environmentId)

    const tagIds = []
    for (const tagName of tags.split(",").map((tag) => tag.trim())) {
      const tagId = await getTagId(environment, tagName)
      if (tagId) {
        tagIds.push({ sys: { type: "Link", linkType: "Entry", id: tagId } })
      }
    }

    const entry = await environment.createEntry("recipe", {
      fields: {
        title: {
          "en-US": title,
        },
        tags: {
          "en-US": tagIds,
        },
      },
    })

    console.log(`Entry created: ${entry.sys.id}`)
  } catch (error) {
    console.error(`Error creating entry: ${error}`)
  }
}

function processCSV(filePath) {
  const entries = []

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      if (row["Recipe Title"] && row.Tags) {
        entries.push({ title: row["Recipe Title"], tags: row.Tags })
      }
    })
    .on("end", async () => {
      console.log("CSV file successfully processed")
      for (const entry of entries) {
        await createEntry(entry.title, entry.tags)
        await delay(1000)
      }
    })
}

processCSV(process.env.CSV_FILE_PATH)
