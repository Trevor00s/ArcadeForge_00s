import OpenAI from 'openai'

const nvidia = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
})

const MODEL = 'nvidia/nemotron-3-super-120b-a12b:free'

const SYSTEM_PROMPT = `/no_think
You are an expert HTML5 canvas game developer. Generate a complete, fun, playable browser game in a single HTML file.

OUTPUT: Raw HTML only. Start with <!DOCTYPE html>. No markdown, no explanation, nothing else.

CRITICAL JAVASCRIPT RULES (violating these breaks the game):
- NEVER use function declarations inside blocks, conditions, or loops. Use const arrow functions instead: const foo = () => {}
- ALL functions must be declared at the top level of the script or as const arrow functions
- Wrap ALL JavaScript in a single top-level IIFE: (function() { ... })();
- NEVER use ES modules (no import/export)

REQUIRED in every game:
- Canvas-based rendering with requestAnimationFrame game loop
- Start screen (title + "Press SPACE or click to start")
- Game over screen with score and "Press R to restart"
- P key toggles pause with a "PAUSED" overlay
- Score display during gameplay
- High score saved to localStorage
- Sounds using Web Audio API (short beeps only)
- Google Font loaded from CDN (choose one that fits the game style)
- Dark themed, visually appealing

SPEED & DIFFICULTY:
- Start easy and slow — player needs a few seconds to get comfortable
- Snake: initial speed = 150ms per move. Speed up by 5ms every 3 food eaten.
- Spaceship/shooter: bullets slow at first, enemy count grows over time
- Any other game: similar gentle start, gradual increase

KEEP IT SIMPLE AND FUN:
- Classic game types work best: Snake, Breakout, Space Invaders, Asteroids, Pong, Flappy Bird, Tetris, etc.
- Clean readable code, no over-engineering
- Game must actually work and be enjoyable`

const TUTORIAL_PROMPT = `/no_think
You are given a browser game description. Return a JSON object (raw JSON only — no markdown, no code fences) with this exact structure:
{
  "title": "Game name",
  "objective": "One sentence what the player must do to win",
  "controls": [
    { "key": "Arrow keys", "action": "Move" }
  ],
  "tips": ["Tip 1", "Tip 2"],
  "restart": "R key or click Restart on game over screen",
  "pause": "P key"
}
Max 3 controls, max 2 tips. If no pause, set pause to null. Raw JSON only.`

function buildMessages(prompt, history, currentGame) {
  const msgs = [{ role: 'system', content: SYSTEM_PROMPT }]
  msgs.push(...history.map(m => ({ role: m.role, content: m.content })))
  if (currentGame) {
    msgs.push({ role: 'user', content: `Current game HTML:\n${currentGame}` })
    msgs.push({ role: 'assistant', content: 'Got it, I have the current game.' })
  }
  msgs.push({ role: 'user', content: prompt })
  return msgs
}

export async function generateGame(prompt, history = [], currentGame = null) {
  const completion = await nvidia.chat.completions.create({
    model: MODEL,
    max_tokens: 4096,
    temperature: 0.7,
    messages: buildMessages(prompt, history, currentGame),
  })
  const raw = completion.choices[0]?.message?.content || ''
  // strip markdown fences + any leading text before the actual HTML
  const stripped = raw
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()
    // fix missing space between html tag and attributes e.g. <htmllang="en"> → <html lang="en">
    .replace(/<html([a-z])/gi, '<html $1')

  // remove any prose/commentary the model added before <!DOCTYPE html> or <html
  const htmlStart = stripped.search(/<!DOCTYPE html>|<html[\s>]/i)
  return htmlStart > 0 ? stripped.slice(htmlStart) : stripped
}

export async function generateTutorial(prompt) {
  const completion = await nvidia.chat.completions.create({
    model: MODEL,
    max_tokens: 400,
    temperature: 0.3,
    messages: [
      { role: 'system', content: TUTORIAL_PROMPT },
      { role: 'user', content: `Game: ${prompt}` },
    ],
  })
  const raw = completion.choices[0]?.message?.content || ''
  const clean = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
  try { return JSON.parse(clean) } catch { return null }
}
