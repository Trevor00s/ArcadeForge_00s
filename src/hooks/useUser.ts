import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

export interface UserProfile {
  userId: string
  username: string
  createdAt: string
}

export function useUser() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { initUser() }, [])

  async function initUser() {
    let userId = localStorage.getItem('af_userId')
    if (!userId) { userId = uuidv4(); localStorage.setItem('af_userId', userId) }

    try {
      const res = await fetch(`/api/profile?userId=${userId}`)
      const data = await res.json()
      if (data.profile) {
        setProfile(data.profile)
      } else {
        const username = localStorage.getItem('af_username') || 'Player'
        const r = await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, username }),
        })
        setProfile((await r.json()).profile)
      }
    } catch {
      setProfile({ userId, username: localStorage.getItem('af_username') || 'Player', createdAt: new Date().toISOString() })
    } finally {
      setLoading(false)
    }
  }

  async function updateUsername(username: string) {
    if (!profile) return
    localStorage.setItem('af_username', username)
    try {
      const r = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.userId, username }),
      })
      setProfile((await r.json()).profile)
    } catch {
      setProfile(prev => prev ? { ...prev, username } : prev)
    }
  }

  return { profile, loading, updateUsername }
}
