require("dotenv").config()
const contentful = require("contentful-management")

// Client init
const client = contentful.createClient(
  {
    accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
  },
  { type: "plain" }
)

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function getImages() {
  const images = await client.asset.getPublished({
    spaceId: process.env.CONTENTFUL_SPACE_ID,
    environmentId: process.env.CONTENTFUL_ENVIRONMENT_ID,
    contentTypeId: "image/png",
  })

  if (!images?.items) {
    return []
  }

  return images?.items
}

async function getRecipes() {
  const recipes = await client.entry.getMany({
    spaceId: process.env.CONTENTFUL_SPACE_ID,
    environmentId: process.env.CONTENTFUL_ENVIRONMENT_ID,
    query: {
      content_type: "recipe",
      limit: 300,
    },
  })

  if (!recipes?.items) {
    return []
  }

  return recipes?.items
}

async function updateRecipe(recipe, image) {
  client.entry.update(
    {
      spaceId: process.env.CONTENTFUL_SPACE_ID,
      environmentId: process.env.CONTENTFUL_ENVIRONMENT_ID,
      entryId: recipe.sys.id,
    },
    {
      sys: recipe.sys,
      fields: {
        ...recipe.fields,
        image: {
          "en-US": {
            sys: {
              type: "Link",
              linkType: "Asset",
              id: image,
            },
          },
        },
      },
    }
  )
}

async function addImageToRecipes() {
  try {
    const images = await getImages()
    const recipes = await getRecipes()

    if (!images) return "No images to add"
    if (!recipes) return "No recipes to update"

    for (const recipe of recipes) {
      const index = Math.floor(images?.length * Math.random())
      const image = images?.[index]?.sys?.id

      await updateRecipe(recipe, image)
      await delay(500)
    }
  } catch (err) {
    console.error(err)
  }
}

addImageToRecipes()
