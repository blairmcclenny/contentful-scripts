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

async function getPages() {
  const pages = await client.entry.getMany({
    spaceId: process.env.CONTENTFUL_SPACE_ID,
    environmentId: process.env.CONTENTFUL_ENVIRONMENT_ID,
    query: {
      content_type: "page",
      limit: 300,
    },
  })

  if (!pages?.items) {
    return []
  }

  return pages?.items
}

async function updatePage(page, image) {
  client.entry.update(
    {
      spaceId: process.env.CONTENTFUL_SPACE_ID,
      environmentId: process.env.CONTENTFUL_ENVIRONMENT_ID,
      entryId: page.sys.id,
    },
    {
      sys: page.sys,
      fields: {
        ...page.fields,
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

async function addImageToPages() {
  try {
    const images = await getImages()
    const pages = await getPages()

    if (!images) return "No images to add"
    if (!pages) return "No pages to update"

    for (const page of pages) {
      const index = Math.floor(images?.length * Math.random())
      const image = images?.[index]?.sys?.id

      await updatePage(page, image)
      await delay(500)
    }
  } catch (err) {
    console.error(err)
  }
}

addImageToPages()
