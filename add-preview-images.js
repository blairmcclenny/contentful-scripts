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

async function getEntries(content_type) {
  const entries = await client.entry.getMany({
    spaceId: process.env.CONTENTFUL_SPACE_ID,
    environmentId: process.env.CONTENTFUL_ENVIRONMENT_ID,
    query: {
      content_type,
      limit: 300,
    },
  })

  if (!entries?.items) {
    return []
  }

  return entries?.items
}

async function updateEntry(entry, image) {
  client.entry.update(
    {
      spaceId: process.env.CONTENTFUL_SPACE_ID,
      environmentId: process.env.CONTENTFUL_ENVIRONMENT_ID,
      entryId: entry.sys.id,
    },
    {
      sys: entry.sys,
      fields: {
        ...entry.fields,
        previewImage: {
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

async function addPreviewImageToEntries() {
  try {
    const images = await getImages()
    const entries = await getEntries('recipe')

    const squareImages = images?.filter(image => image.fields.title['en-US'].includes('1080x1080'))

    if (!images || !squareImages) return "No images to add"
    if (!entries) return "No entries to update"

    for (const entry of entries) {
      const index = Math.floor(squareImages?.length * Math.random())
      const image = squareImages?.[index]?.sys?.id

      await updateEntry(entry, image)
      await delay(500)
    }
  } catch (err) {
    console.error(err)
  }
}

addPreviewImageToEntries()
