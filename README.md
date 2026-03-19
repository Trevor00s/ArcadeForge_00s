# ArcadeForge

AI-powered game builder on Aptos. Describe any game in plain text and watch it come to life in seconds.

## Features

- **AI Game Generation** — Powered by Groq (llama-3.3-70b), generates fully playable HTML games from a text prompt
- **Petra Wallet** — Connect your Aptos wallet via the Profile page
- **Shelby Protocol Storage** — Save games on-chain to Aptos testnet (per-wallet, private)
- **Library** — Each wallet sees only its own saved games
- **Marketplace** — Browse community-built games

## Stack

- React + Vite + TypeScript + Tailwind + shadcn/ui
- Express backend (port 3001)
- Aptos Wallet Adapter (`@aptos-labs/wallet-adapter-react`)
- Shelby Protocol SDK (`@shelby-protocol/sdk`)

## Getting Started

```bash
npm install
cp .env.example .env   # add your GROQ_API_KEY and VITE_SHELBY_API_KEY
npm run dev            # starts Vite (8080) + Express (3001)
```

## Environment Variables

```
GROQ_API_KEY=
VITE_SHELBY_API_KEY=
```
