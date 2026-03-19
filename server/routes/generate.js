import { Router } from 'express'
import { generateGame, generateTutorial } from '../services/groq.js'

const router = Router()

router.post('/', async (req, res) => {
  const { prompt, history, currentGame } = req.body
  if (!prompt?.trim()) return res.status(400).json({ error: 'prompt required' })
  try {
    const [html, tutorial] = await Promise.all([
      generateGame(prompt.trim(), history || [], currentGame || null),
      generateTutorial(prompt.trim()),
    ])
    res.json({ html, tutorial })
  } catch (err) {
    console.error('[generate]', err.message)
    res.status(500).json({ error: err.message || 'Generation failed' })
  }
})

export default router