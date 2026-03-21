import 'dotenv/config'
import express from 'express'
import { fileURLToPath } from 'url'
import path from 'path'
import { existsSync } from 'fs'
import generateRoute from './routes/generate.js'
import gamesRoute from './routes/games.js'
import profileRoute from './routes/profile.js'
import listingsRoute from './routes/listings.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json({ limit: '5mb' }))

app.use('/api/generate', generateRoute)
app.use('/api/games', gamesRoute)
app.use('/api/profile', profileRoute)
app.use('/api/listings', listingsRoute)
app.get('/api/health', (_, res) => res.json({ ok: true }))

const distPath = path.join(__dirname, '..', 'dist')
if (existsSync(distPath)) {
  console.log('Serving React from', distPath)
  app.use(express.static(distPath))
  app.get('*', (_, res) => res.sendFile(path.join(distPath, 'index.html')))
} else {
  console.log('No dist/ found — API only mode')
}

app.listen(PORT, () => {
  console.log(`ArcadeForge running on http://localhost:${PORT}`)
})
