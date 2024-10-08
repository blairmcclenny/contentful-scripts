function getRandomDate(start, end) {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const randomTime =
    startDate.getTime() +
    Math.random() * (endDate.getTime() - startDate.getTime())
  const randomDate = new Date(randomTime)

  return randomDate.toISOString()
}

function getRandomISODateString() {
  const start = "2024-01-01T00:00:00.000Z"
  const end = "2024-10-01T00:00:00.000Z"

  return getRandomDate(start, end)
}

module.exports = {
  getRandomISODateString,
}
