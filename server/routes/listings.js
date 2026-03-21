import express from 'express'

const router = express.Router()

// In-memory listings: { [gameId]: { priceApt, owner, name, metadata_uri } }
const listings = {}

router.get('/', (req, res) => res.json(listings))

router.post('/', (req, res) => {
  const { gameId, priceApt, owner, name, metadata_uri } = req.body
  if (!gameId || !owner) return res.status(400).json({ error: 'Missing fields' })
  listings[gameId] = {
    priceApt: Math.max(0, Number(priceApt) || 0),
    owner,
    name,
    metadata_uri,
  }
  res.json({ ok: true })
})

export default router
