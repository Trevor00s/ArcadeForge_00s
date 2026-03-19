import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getGames, saveGame, deleteGame } from '../services/shelby.js'

const router = Router()

router.get('/', async (req, res) => {
  const { userId } = req.query
  if (!userId) return res.status(400).json({ error: 'userId required' })
  try {
    res.json({ games: await getGames(userId) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/save', async (req, res) => {
  const { userId, title, html } = req.body
  if (!userId || !html) return res.status(400).json({ error: 'userId and html required' })
  try {
    const game = { id: uuidv4(), title: title || 'Untitled Game', html, createdAt: new Date().toISOString() }
    res.json({ game: await saveGame(userId, game) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:gameId', async (req, res) => {
  const { userId } = req.query
  if (!userId) return res.status(400).json({ error: 'userId required' })
  try {
    await deleteGame(userId, req.params.gameId)
    res.json({ deleted: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
