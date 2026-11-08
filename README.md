# Rivalry

**Challenge your friends. Prove your skills. Win.**

Rivalry is a social gaming challenge platform planned for Solana. Instead of
playing alone, players create a challenge, share a unique link, and friends
compete under identical conditions (same seed, same level). The design uses
Solana (Devnet) for challenge commitments, prize escrow, reward distribution
and portable player achievements.

## Status

**Planning stage.** This repository currently holds documentation only:

- `prd.md` - full product requirements document (the build spec; status: Hackathon MVP)
- `resources.md` - hacker resources plus game-specific references

No game code has been written yet. Nothing here is deployed. Implementation is
scheduled after the TrustLayer build, following the 48-hour roadmap in `prd.md`
(section 18).

## Planned MVP (from the PRD)

- One polished 2D obstacle-course game ("Obstacle Rush") built with Phaser 3
- Deterministic, seed-based level generation so every participant plays the same level
- Challenge creation with unique shareable links
- Server-verified results and leaderboards (anti-cheat by design)
- Solana Devnet integration: challenge commitments, prize escrow, reward distribution (Anchor)

## Planned stack

Next.js + TypeScript + Tailwind CSS, Phaser 3 game engine, Node.js backend,
Supabase/PostgreSQL, Solana (Devnet) with Anchor and Wallet Adapter.

## PRD source

The PRD in `prd.md` is preserved from the original shared conversation:
https://chatgpt.com/s/t_6aefbb31147881919af20d12d60a9e18
