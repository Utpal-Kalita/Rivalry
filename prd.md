RIVALRY
Product Requirements Document (PRD)

Tagline: Challenge your friends. Prove your skills. Win.

| Field | Details |
|---|---|
| Product | Rivalry |
| Category | Web3 Gaming / Social Gaming |
| Blockchain | Solana |
| Network | Devnet |
| Platform | Web application |
| Target users | Casual gamers, competitive players and gaming communities |
| Document version | 1.0 |
| Status | Hackathon MVP |

## 1. Executive Summary

Rivalry is a social gaming challenge platform where anyone can challenge friends, compete in skill-based mini-games and win rewards.

Instead of discovering games and playing alone, users discover games through challenges shared by friends.

A player can create a challenge, select a game, configure its difficulty, set a target score or completion time, and share a unique invitation link.

Other players join the challenge and compete under identical conditions.

Rivalry uses Solana for challenge commitments, prize escrow, reward distribution and portable player achievements.

Our vision is to make every game a social competition that anyone can create, share and participate in.

## 2. The Problem

Most casual gaming experiences are isolated.

Players download games, play independently and compete through leaderboards that are often disconnected from their social networks.

There are several problems:

Creating a competition between friends is unnecessarily complicated.

Most casual games lack simple challenge-sharing mechanisms.

Players have limited ways to organize informal competitions.

Game developers need infrastructure for challenges, tournaments and rewards.

Gaming achievements and competition history are often locked inside individual games.

The opportunity

What if creating a gaming competition was as simple as sharing a link?

Imagine receiving a message:

I just completed this obstacle course in 42 seconds. Think you can beat me?

You open the link, play the same level and try to beat the score.

That's Rivalry.

## 3. Product Vision

Rivalry aims to become a social competition layer for online gaming.

We want to make it possible for:

Anyone to create gaming challenges.

Friends to compete through shareable links.

Communities to organize competitions.

Creators to host tournaments.

Game developers to integrate challenge infrastructure.

Players to build portable gaming identities and achievements.

Long-term vision

Instead of building another standalone gaming platform, Rivalry aims to provide infrastructure that makes existing games more competitive and social.

## 4. Target Audience

Primary users

1. Casual gamers

People who enjoy simple games and competing with friends.

2. Competitive gamers

Players who enjoy beating scores, setting records and participating in challenges.

3. Gaming communities

Discord communities, university clubs and online groups that organize competitions.

Secondary users

4. Game developers

Developers who want to add social challenges, leaderboards and reward distribution to their games.

5. Gaming creators

Streamers and content creators who want to organize competitions with their audiences.

## 5. Core Product Concept

Rivalry revolves around one fundamental interaction:

Create → Challenge → Compete → Win → Share

A player creates a challenge using a mini-game.

The platform generates a unique challenge link.

Other players open the link and participate in the same game configuration.

Once everyone finishes, Rivalry determines the winner based on verified game results.

Example

Utpal creates an obstacle-course challenge.

Configuration:

| Parameter | Value |
|---|---|
| Game | Obstacle Rush |
| Challenge name | Beat My Record |
| Level | Level 12 |
| Difficulty | Medium |
| Players | 4 |
| Competition | Fastest completion |
| Prize | 0.05 SOL |
| Deadline | 24 hours |

Utpal shares the challenge link with three friends.

All four players compete on the same level.

The player with the fastest valid completion time wins.

The prize is distributed according to the challenge rules.

## 6. Core Features

### Module 1: User Authentication and Player Profiles

Objective: Give every player a persistent gaming identity.

Functional requirements

Users can sign in.

Users can connect a Solana wallet.

Every user has a unique player profile.

Users can select a username and profile picture.

Users can view their competition history.

Users can view their achievements.

Player profile

| Field | Description |
|---|---|
| Username | Player's display name |
| Wallet | Connected Solana address |
| Total challenges | Challenges participated in |
| Wins | Total victories |
| Win rate | Percentage of challenges won |
| Best score | Highest recorded score |
| Achievements | Unlocked achievements |

Acceptance criteria

Users can create profiles.

Wallets can be connected.

Competition results appear on player profiles.

Users can view their historical performance.

### Module 2: Mini-Game Engine

Objective: Provide playable games that support competitive challenges.

For the MVP, build one polished 2D obstacle-course game.

Game concept: Obstacle Rush

Players control a character navigating through an obstacle course.

Gameplay mechanics:

Move left and right.

Jump over obstacles.

Avoid moving hazards.

Collect optional bonuses.

Reach the finish line as quickly as possible.

Game requirements

Smooth keyboard controls.

Responsive game interface.

Timer.

Score calculation.

Collision detection.

Game-over screen.

Completion screen.

Restart functionality.

Important requirement

The game must support deterministic level generation.

A challenge should use a predefined seed to generate the same obstacle arrangement for every participant.

This ensures that players compete under identical conditions.

### Module 3: Challenge Creator

Objective: Allow players to create competitions.

Functional requirements

Users can:

Select a mini-game.

Enter a challenge name.

Select difficulty.

Configure the challenge duration.

Set a maximum participant count.

Choose a competition format.

Optionally configure a prize.

Generate a unique challenge link.

Challenge configuration

| Parameter | Description |
|---|---|
| Challenge ID | Unique identifier |
| Creator | Challenge owner |
| Game ID | Selected game |
| Level seed | Deterministic level generation |
| Difficulty | Easy / Medium / Hard |
| Competition type | Fastest time / Highest score |
| Maximum players | Participant limit |
| Entry deadline | Last time to join |
| Completion deadline | Last time to submit |
| Prize pool | Optional SOL reward |
| Status | Open / Active / Completed |

Competition formats

A. Fastest completion

Players compete to finish the level in the shortest time.

B. Highest score

Players compete to achieve the highest score within a fixed duration.

Acceptance criteria

Users can create challenges.

Every challenge receives a unique ID.

Every challenge has a unique shareable URL.

Challenge configuration cannot be modified after participation begins.

Players can view challenge details before joining.

### Module 4: Challenge Participation

Objective: Make it easy for players to join competitions.

Functional requirements

Players can open a challenge through a shared URL.

Players can view challenge information.

Players can see the creator's profile.

Players can join open challenges.

Players can see the participant list.

Players can start the game.

Players can submit their results.

Challenge states

```
CREATED
   |
   v
OPEN
   |
   v
ACTIVE
   |
   v
COMPLETED
   |
   v
REWARDS DISTRIBUTED
```

A challenge can also expire or be cancelled according to its configured rules.

Acceptance criteria

Players can join through invitation links.

Duplicate participation is prevented.

Only eligible participants can submit results.

Expired challenges cannot accept new participants.

## 7. Module 5: Fair Play and Result Verification

This is one of Rivalry's most important technical components.

A gaming competition is meaningless if players can manipulate their scores.

Rivalry must implement a result-verification system.

The problem

A player could potentially:

Modify their browser game state.

Manipulate the timer.

Submit an artificially high score.

Replay an old result.

Submit multiple results for the same challenge.

Proposed solution

Use a combination of deterministic game generation and server-side verification.

Step 1: Challenge commitment

When a challenge is created:

Generate a unique random seed.

Store the seed or its cryptographic commitment.

Freeze the game configuration.

Associate the challenge with a unique ID.

Step 2: Identical gameplay

Every participant receives the same level configuration.

Step 3: Result submission

The game submits:

Challenge ID.

Player ID.

Final score.

Completion time.

Gameplay event data.

Unique submission nonce.

Step 4: Verification

The backend checks:

Whether the player joined the challenge.

Whether the challenge is active.

Whether the submitted result is within possible game limits.

Whether the event sequence is valid.

Whether the result has already been submitted.

Whether the submission is within the deadline.

Step 5: Final result

Only verified results are considered for the leaderboard.

Additional anti-cheat measures

Server-controlled challenge timing.

Rate limiting.

Duplicate submission prevention.

Server-side score calculation where possible.

Replay detection.

Signed result records.

Important: A random seed alone does not prove fair gameplay. The server must validate results. The MVP should use a server-authoritative or independently verifiable game-result mechanism.

## 8. Module 6: Leaderboards and Competition Results

Objective: Make competitions engaging and competitive.

Functional requirements

Display all participants.

Display verified scores.

Rank participants.

Highlight the winner.

Display competition completion status.

Show historical results.

Example leaderboard

| Rank | Player | Completion time | Status |
|---|---|---|---|
| 1 | Utpal | 42.3 seconds | Winner |
| 2 | Alex | 45.8 seconds | Completed |
| 3 | Rahul | 49.2 seconds | Completed |
| 4 | Sam | 54.1 seconds | Completed |

Acceptance criteria

Results are ranked correctly.

Unverified results are excluded.

Leaderboards update when results are verified.

Winners are clearly identified.

## 9. Module 7: Solana Integration

Solana should provide meaningful functionality rather than being added only for marketing.

Rivalry will initially use Solana for four purposes.

### 9.1 Challenge commitments

Store challenge commitments on-chain.

This helps establish that the challenge configuration was fixed before competition began.

### 9.2 Prize escrow

When a creator attaches a prize, the reward can be deposited into a program-controlled escrow account.

The prize remains locked until the competition is completed or refunded under the configured cancellation rules.

### 9.3 Reward distribution

After result verification, the winning player receives the reward.

### 9.4 Player achievements

Important achievements can be recorded on-chain.

Examples:

First challenge won.

10 consecutive victories.

Tournament champion.

Community champion.

These achievements can eventually become portable across supported games.

Proposed Solana architecture

```
         RIVALRY FRONTEND
                |
                v
          BACKEND API
                |
        +-------+-------+
        |               |
        v               v
   GAME ENGINE     CHALLENGE ENGINE
        |               |
        v               v
   RESULT VERIFY    DATABASE
        |               |
        +-------+-------+
                |
                v
          SOLANA PROGRAM
                |
       +--------+--------+
       |                 |
       v                 v
  PRIZE ESCROW     CHALLENGE
                   COMMITMENT
       |
       v
  WINNER PAYMENT
```

Important implementation decision

Do not put real-time gameplay or every player action on-chain.

Keep gameplay and result verification off-chain.

Use Solana for commitments, escrow and reward settlement.

For the hackathon, all financial interactions should use Devnet SOL.

## 10. Module 8: Social Sharing

Objective: Make challenges naturally spread between players.

Sharing is central to Rivalry's growth strategy.

Functional requirements

Every challenge has a unique invitation link.

Players can copy challenge links.

Players can share challenges through messaging apps.

Completed results can be shared as cards.

Players can challenge specific friends.

Players can invite others to beat their scores.

Example share card

```
       RIVALRY

    BEAT MY RECORD

       42.3 SEC

   Can you do better?

   [ACCEPT CHALLENGE]

       Rivalry
```

Growth loop

```
Player creates challenge
          |
          v
Shares invitation link
          |
          v
Friends join
          |
          v
Friends compete
          |
          v
Winner shares result
          |
          v
More players join
```

## 11. User Interface Requirements

The interface should feel like a modern gaming platform rather than a traditional Web3 dashboard.

Screen 1: Landing Page

Sections:

Hero section.

Featured challenges.

Trending competitions.

Popular games.

How it works.

Call to action.

Primary buttons:

Create Challenge.

Explore Challenges.

Screen 2: Discover

Display:

Trending challenges.

Recently created challenges.

Popular games.

Challenges from friends.

Community competitions.

Screen 3: Challenge Creator

A simple configuration interface.

Users should be able to create a challenge in under one minute.

Screen 4: Game Interface

The actual playable game.

Priorities:

Responsive controls.

Smooth animations.

Clear timer.

Score display.

Minimal distractions.

Screen 5: Challenge Details

Display:

Challenge creator.

Game details.

Number of participants.

Prize pool.

Deadline.

Leaderboard.

Join button.

Screen 6: Results

Display:

Final rankings.

Winner.

Player performance.

Reward status.

Share result button.

Challenge again button.

Screen 7: Player Profile

Display:

Username.

Wallet.

Wins.

Total challenges.

Achievements.

Competition history.

## 12. Technical Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Game Engine | Phaser 3 |
| Backend | Node.js |
| Database | Supabase / PostgreSQL |
| Authentication | Privy or wallet authentication |
| Blockchain | Solana |
| Solana SDK | Solana Kit or compatible SDK |
| Smart Contracts | Anchor |
| Wallet Integration | Wallet Adapter |
| Deployment | Vercel |
| Backend Hosting | Render |

Why Phaser?

Phaser is a JavaScript game framework suitable for browser-based 2D games.

It allows the game to run directly inside the Rivalry web application.

Documentation: Phaser Documentation

Why Anchor?

Anchor can be used to develop the Solana program responsible for challenge commitments and prize escrow.

Documentation: Anchor Documentation

## 13. Database Design

Users

| Column | Type |
|---|---|
| id | UUID |
| username | TEXT |
| wallet_address | TEXT |
| avatar_url | TEXT |
| created_at | TIMESTAMP |

Games

| Column | Type |
|---|---|
| id | UUID |
| name | TEXT |
| description | TEXT |
| game_url | TEXT |
| status | TEXT |

Challenges

| Column | Type |
|---|---|
| id | UUID |
| creator_id | UUID |
| game_id | UUID |
| title | TEXT |
| seed | TEXT |
| seed_commitment | TEXT |
| difficulty | TEXT |
| competition_type | TEXT |
| max_players | INTEGER |
| prize_amount | NUMERIC |
| deadline | TIMESTAMP |
| status | TEXT |
| created_at | TIMESTAMP |

Participants

| Column | Type |
|---|---|
| id | UUID |
| challenge_id | UUID |
| user_id | UUID |
| joined_at | TIMESTAMP |
| status | TEXT |

Results

| Column | Type |
|---|---|
| id | UUID |
| challenge_id | UUID |
| user_id | UUID |
| score | INTEGER |
| completion_time | NUMERIC |
| event_data | JSONB |
| verification_status | TEXT |
| submitted_at | TIMESTAMP |

Rewards

| Column | Type |
|---|---|
| id | UUID |
| challenge_id | UUID |
| winner_id | UUID |
| amount | NUMERIC |
| transaction_signature | TEXT |
| status | TEXT |

## 14. API Requirements

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/users | Create player profile |
| GET | /api/users/:id | Get player profile |
| GET | /api/games | Get available games |
| POST | /api/challenges | Create challenge |
| GET | /api/challenges | Discover challenges |
| GET | /api/challenges/:id | Get challenge details |
| POST | /api/challenges/:id/join | Join challenge |
| POST | /api/challenges/:id/start | Start gameplay session |
| POST | /api/results/submit | Submit game result |
| POST | /api/results/verify | Verify submitted result |
| GET | /api/challenges/:id/leaderboard | Get leaderboard |
| POST | /api/rewards/claim | Claim eligible reward |

The backend must independently verify eligibility and results. The frontend must never be trusted to determine winners or authorize prize withdrawals.

## 15. MVP Scope

The hackathon timeline is limited. We should focus on one excellent gaming experience.

P0 — Must Have

| Feature | Priority |
|---|---|
| Landing page | P0 |
| Wallet connection | P0 |
| Player profiles | P0 |
| One playable 2D game | P0 |
| Deterministic level generation | P0 |
| Challenge creation | P0 |
| Shareable challenge links | P0 |
| Challenge participation | P0 |
| Score submission | P0 |
| Basic anti-cheat verification | P0 |
| Leaderboards | P0 |
| Solana Devnet integration | P0 |

P1 — Important

SOL prize escrow.

Automated reward distribution.

Player achievements.

Challenge sharing cards.

Daily challenges.

Friend invitations.

P2 — Future Development

Multiple mini-games.

User-generated games.

Community tournaments.

Creator rewards.

Game developer SDK.

Cross-game achievements.

Portable player identity.

Custom game modes.

## 16. Features to Avoid During the Hackathon

Do not spend time implementing:

Multiple complex games.

A complete NFT marketplace.

A sophisticated social network.

Real-time multiplayer gameplay.

Cross-game asset interoperability.

Complex AI opponents.

A custom gaming engine.

A complicated token economy.

These features can come later.

The MVP should prove that the challenge-sharing loop works.

## 17. Demo Scenario

The demo should tell a simple story.

Step 1: Create a challenge

Utpal opens Rivalry.

He selects Obstacle Rush.

He creates:

Beat My Record

Same level for everyone.

Fastest completion wins.

Four players.

Optional 0.05 SOL prize.

Step 2: Share the challenge

Rivalry generates a unique URL.

Utpal shares it with three friends.

Step 3: Players compete

All four players open the same challenge.

They play the same obstacle course.

Step 4: Results are verified

The backend validates the submitted results.

The leaderboard updates.

Step 5: Winner is announced

The fastest player wins.

The result appears on the leaderboard.

If prize escrow is enabled, the winner receives the prize through Solana Devnet.

Step 6: Social sharing

The winner shares:

"I just beat three friends on Rivalry. Who's next?"

This brings more players into the platform.

## 18. Development Roadmap

Suggested 48-hour development plan.

| Phase | Time | Deliverable |
|---|---|---|
| 1 | 0–3 hours | Architecture and project setup |
| 2 | 3–10 hours | Playable Phaser game |
| 3 | 10–15 hours | Deterministic level generation |
| 4 | 15–21 hours | Challenge creation and sharing |
| 5 | 21–27 hours | Participation and game sessions |
| 6 | 27–32 hours | Result verification and leaderboard |
| 7 | 32–39 hours | Solana integration |
| 8 | 39–44 hours | UI refinement and player profiles |
| 9 | 44–48 hours | Testing and demo preparation |

Critical milestone

By hour 15, the game should already be playable.

By hour 27, a player should be able to create a challenge and another player should be able to join through a link.

Do not delay the core gameplay to build blockchain features.

## 19. Success Metrics

Hackathon metrics

| Metric | Target |
|---|---|
| Playable games | 1 |
| Successful challenge creation | 100% |
| Successful challenge joining | 100% |
| Identical level generation | 100% |
| Valid result submissions | 100% |
| Duplicate submissions accepted | 0 |
| Successful leaderboard generation | 100% |
| Successful Devnet integration | At least 1 |

Long-term metrics

Daily active players.

Challenges created per day.

Average participants per challenge.

Challenge completion rate.

Invitation-to-registration conversion.

Repeat participation.

Weekly active creators.

Reward distribution volume.

## 20. Business Model

Rivalry could eventually generate revenue through several channels.

| Revenue stream | Description |
|---|---|
| Tournament fees | Platform fee for organizer-created tournaments |
| Creator tools | Paid features for gaming creators |
| Developer SDK | Subscription or usage-based pricing |
| Sponsored challenges | Brands sponsor gaming competitions |
| Premium profiles | Customization and advanced statistics |
| Community tournaments | Tools for organizing large competitions |

For the initial version, keep challenge creation and participation free.

Any future fees on prize competitions will need clear disclosure and appropriate legal review.

## 21. Competitive Positioning

Rivalry is not trying to compete directly with large game studios.

It is building a social competition layer.

| Existing category | Primary focus |
|---|---|
| Casual gaming platforms | Playing games |
| Game marketplaces | Discovering and purchasing games |
| Tournament platforms | Organized competitions |
| Social gaming apps | Playing with friends |
| Rivalry | Creating and sharing instant gaming challenges |

Differentiation

The central experience is not discovering a game.

It is receiving a challenge from someone you know and trying to beat them.

Solana provides the infrastructure for transparent challenge commitments, prize escrow and reward distribution.

## 22. Risks and Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| Browser-based cheating | High | Server-side verification |
| Low player retention | High | Daily challenges and social loops |
| Poor game experience | Critical | Prioritize gameplay quality |
| Slow blockchain transactions | Medium | Keep gameplay off-chain |
| Prize disputes | High | Transparent rules and verified results |
| Difficulty attracting users | High | Shareable challenge links |
| Excessive feature scope | High | One game for MVP |

## 23. Long-Term Roadmap

Phase 1: Social Challenges

One mini-game.

Challenge creation.

Friend invitations.

Leaderboards.

Basic rewards.

Phase 2: Gaming Community

Multiple mini-games.

Daily competitions.

Community tournaments.

Player achievements.

Creator profiles.

Phase 3: Creator Economy

User-generated challenges.

Custom game modes.

Sponsored competitions.

Creator monetization.

Phase 4: Gaming Infrastructure

Developer SDK.

Challenge APIs.

Cross-game achievements.

Portable player identity.

Shared reward infrastructure.

## 24. Final Product Definition

Rivalry makes gaming competitive by default.

Instead of playing games independently, players create challenges and invite others to beat them.

Every challenge becomes a social interaction.

Every victory becomes something worth sharing.

Solana provides the infrastructure for verifiable commitments, transparent rewards and portable achievements.

Rivalry — The internet's playground for friendly competition.

## 25. Instructions for Claude Code

Use this as the implementation brief.

Development priorities

Build in this exact order:

Set up Next.js and the application architecture.

Build the Obstacle Rush game using Phaser 3.

Implement deterministic level generation.

Build the challenge creation system.

Implement unique challenge URLs.

Build the participation flow.

Implement score submission and backend verification.

Build leaderboards.

Integrate Solana Devnet.

Polish the interface and prepare the demo.

Design direction

I recommend:

Dark gaming interface.

Near-black background.

Electric purple and blue accents.

Large typography.

Bold challenge cards.

Animated game interactions.

Minimal wallet-related UI.

Strong visual focus on scores, rankings and player competition.

Non-negotiable requirements

The game must actually be playable.

Two different users must be able to join the same challenge.

Both users must receive identical level configurations.

The backend must verify submitted scores.

The leaderboard must rank valid results.

Solana must provide a real function in the product.

No fake blockchain transactions or simulated reward claims.

Most important: Build the game and challenge-sharing experience first. If those two things aren't enjoyable, adding blockchain won't make Rivalry a good gaming product.
