# ArcadeForge

AI-powered game builder on Aptos. Describe any game in plain text and get a fully playable HTML5 game — then mint it as an NFT and list it on the marketplace.

## Features

- **AI Game Generation** — Powered by DeepSeek V3 via OpenRouter. Describe a game, get a playable HTML5 game in under a minute
- **Shelby Protocol Storage** — Save games on-chain to Aptos testnet (per-wallet, private)
- **NFT Minting** — Mint your games as NFTs on Aptos (Token V1) with one click
- **Marketplace** — List games for free or set an APT price. Other users pay to play, revenue goes directly to the creator
- **Micropayment Gating** — Set a price on your game, buyers pay APT directly to your wallet
- **Petra Wallet Integration** — Connect wallet from the TopBar, copy address, disconnect
- **Dark / Light Mode** — Toggle theme from the navigation bar
- **Game Library** — Per-wallet game storage, list on marketplace or mint as NFT

## Stack

- **Frontend** — React + Vite + TypeScript + Tailwind + shadcn/ui
- **Backend** — Express (port 3001)
- **AI** — DeepSeek V3 via OpenRouter API
- **Blockchain** — Aptos testnet, Petra Wallet Adapter
- **Storage** — Shelby Protocol SDK (on-chain blob storage)
- **NFTs** — Aptos Token V1 (`0x3::token`)

## Getting Started

```bash
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

```
OPENROUTER_API_KEY=       # OpenRouter API key (deepseek/deepseek-chat-v3-0324)
VITE_SHELBY_API_KEY=      # Shelby Protocol API key
```

## Architecture

```
src/
├── pages/
│   ├── Home.tsx          # Landing page with orbital graphic
│   ├── Build.tsx         # AI game builder (prompt → game)
│   ├── Library.tsx       # Saved games, mint & list actions
│   └── Marketplace.tsx   # Browse & play listed games
├── components/
│   └── TopBar.tsx        # Navigation, theme toggle, wallet
├── contexts/
│   └── ThemeContext.tsx   # Dark/light mode provider
├── hooks/
│   ├── useShelby.ts      # Shelby Protocol (save/load/list games)
│   ├── useNFT.ts         # NFT minting & payment
│   └── useWallet.ts      # Petra wallet connection
server/
├── index.js              # Express server
├── routes/
│   ├── generate.js       # POST /api/generate (AI game generation)
│   └── listings.js       # GET/POST /api/listings (marketplace)
└── services/
    └── groq.js           # DeepSeek V3 via OpenRouter
```

## Deployment

Deployed on Railway. Set environment variables in Railway dashboard:

```
OPENROUTER_API_KEY=your_key
VITE_SHELBY_API_KEY=your_key
```
