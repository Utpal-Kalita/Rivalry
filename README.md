# Rivalry

**Challenge your friends. Prove your skills. Win.**

Rivalry is a social gaming challenge platform planned for Solana. Instead of
playing alone, players create a challenge, share a unique link, and friends
compete under identical conditions (same seed, same level). The design uses
Solana (Devnet) for challenge commitments, prize escrow, reward distribution
and portable player achievements.

## Status

**MVP built.** Next.js 15 + TypeScript + Tailwind, Phaser 3, Solana devnet.

## Run it

```bash
npm install
cp .env.example .env.local   # optional: RIVALRY_SECRET, ESCROW_SECRET_KEY for SOL prizes
npm run dev                  # http://localhost:3000
npm test                     # level generation + replay verification tests
```

## How it works

- **Obstacle Rush** (`lib/game/sim.ts`): seeded level generator + fixed 60 Hz physics in plain TypeScript.
  Phaser (`components/Game.tsx`) only renders and reads input; the same simulation runs in the browser and on the server.
- **Challenges**: create, share `/c/<id>`, join, play. Seed is drawn on the server, hidden until the
  challenge closes, and committed as `sha256(id|seed|difficulty|mode)`.
- **Verification** (`app/api/results/submit`): the client sends only its input log. The server replays it,
  recomputes time/score, and rejects runs that don't finish, arrive faster than real time, reuse a nonce,
  come from non-participants or after the deadline. Results are HMAC-signed (`/api/results/verify`).
- **Solana devnet** (`lib/server/solana.ts`, `lib/client/wallet.ts`): players link a wallet by signing a message;
  the creator signs a Memo transaction carrying the commitment (plus the prize transfer to escrow), which the
  server checks on-chain; the winner claims and the escrow wallet pays out. All transactions link to the explorer.
- **Profiles**: wins, win rate, best score, fastest finish, achievements, history.

Storage is a JSON file in `.data/` (swap `lib/server/db.ts` for Supabase in production; a serverless host
needs a real database). Wallets: Phantom / Solflare / Backpack via their injected providers, set to devnet.
Design tokens were dealt with the `design-taste-frontend` skill (palette lunar-grey-bronze, Archivo).

## PRD source

The PRD in `prd.md` is preserved from the original shared conversation:
https://chatgpt.com/s/t_6aefbb31147881919af20d12d60a9e18
