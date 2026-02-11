# BitDoge Web

React + Vite frontend for interacting with the BitDoge contract on Ethereum mainnet.

## Requirements
- Node.js (recommended: recent LTS)

## Run locally
```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Build
```bash
npm run build
npm run preview
```

## Configuration

The app currently targets **Ethereum mainnet** and uses a fixed contract address in `src/App.jsx`:
- `0x000000001994bb7b8ee7d91012bdecf5ec033a7f`

Optional environment variables:
- `VITE_PROJECT_ID`: WalletConnect project id for RainbowKit.

## Tech
- RainbowKit + wagmi + viem
- Tailwind CSS
