const contentfulManagement = require("contentful-management")
require("dotenv").config()

const client = contentfulManagement.createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
})

const spaceId = process.env.CONTENTFUL_SPACE_ID
const environmentId = process.env.CONTENTFUL_ENVIRONMENT_ID
const recipeTemplateId = process.env.CONTENTFUL_RECIPE_TEMPLATE_ID

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function updateRecipes() {
  try {
    const space = await client.getSpace(spaceId)
    const environment = await space.getEnvironment(environmentId)

    const template = await environment.getEntry(recipeTemplateId)

    const entries = await environment.getEntries({
      content_type: "recipe",
      limit: 1000,
    })

    for (const entry of entries.items) {
      if (entry.sys.id === recipeTemplateId) {
        continue
      }

      entry.fields.details = template.fields.details
      entry.fields.summary = {
        "en-US": `This is a summary for ${entry.fields.title["en-US"]}`,
      }

      await entry.update()
      await delay(250)

      console.log(`Entry updated: ${entry.sys.id}`)
    }
  } catch (error) {
    console.error(`Error fetching entries: ${error}`)
  }
}

updateRecipes()
