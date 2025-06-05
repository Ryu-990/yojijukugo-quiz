// server.js
const { loadNuxt } = require('@nuxt/kit')
const http = require('http')

async function start() {
  const nuxt = await loadNuxt({
    dev: process.env.NODE_ENV !== 'production',
    rootDir: __dirname
  })

  const server = http.createServer(nuxt.server.app)
  await nuxt.server.listen(server)

  const port = process.env.PORT || 3000
  server.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://localhost:${port}`)
  })
}

start().catch((error) => {
  console.error('Error starting server:', error)
  process.exit(1)
})