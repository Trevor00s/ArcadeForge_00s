import { Router } from 'express'
import { getProfile, saveProfile } from '../services/shelby.js'

const router = Router()

router.get('/', async (req, res) => {
  const { userId } = req.query
  if (!userId) return res.status(400).json({ error: 'userId required' })
  try {
    res.json({ profile: await getProfile(userId) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  const { userId, username, avatar } = req.body
  if (!userId) return res.status(400).json({ error: 'userId required' })
  try {
    const existing = await getProfile(userId) || {}
    const updated = {
      ...existing,
      userId,
      username: username || existing.username || 'Player',
      avatar: avatar || existing.avatar || null,
      updatedAt: new Date().toISOString(),
      createdAt: existing.createdAt || new Date().toISOString(),
    }
    await saveProfile(userId, updated)
    res.json({ profile: updated })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
