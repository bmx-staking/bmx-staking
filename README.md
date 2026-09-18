# BMX Staking — Professional UI Upgrade

This package is a polished, responsive front-end prototype for a BMX staking dashboard.

## Included
- Professional responsive dashboard
- Wallet connection modal (preview only)
- Staking flow
- Referral dashboard
- Transfer flow
- Profile, support, FAQ, login and register pages
- Local browser state for the preview balance/activity
- Mobile navigation
- Clear preview disclosure

## Important
The 1,000,000,000 BMX starting balance is **not a real blockchain token balance**. It is stored in browser `localStorage` for previewnstration.

No private keys, seed phrases, deposits, withdrawals, or real blockchain transactions are used.

To make this production-ready, the front end must be connected to a real token contract/program and wallet adapter, with on-chain balance reads and a secure/audited staking implementation.

## GitHub Pages
Upload the files to your repository and enable GitHub Pages. No build step is required.


## Current platform status

This release is styled as a production-quality platform preview. The interface is presentation-ready, but blockchain functionality has not been connected yet. BMX balances, staking rewards, transfers, referrals, and activity shown by the frontend are simulated and have no monetary value. No real deposits, withdrawals, private keys, or blockchain transactions are performed.

## Referral tracking

Each registered browser user receives a unique referral code and shareable registration URL. When a new registration uses that URL, the referrer relationship is recorded and displayed on the Referrals page.

This is **browser-local simulation tracking**. It does not provide a shared server/database, real account system, real referral payouts, or blockchain rewards. For production use, referral relationships should be stored in a secure backend/database with proper authentication and anti-abuse controls.

## Sign in / Sign out flow

The preview now has a complete browser-local account flow:
- New visitors land on the introduction page.
- Sign Up creates a local preview account and signs the user in.
- Sign In checks the locally stored preview account.
- Protected pages redirect unauthenticated visitors back to the introduction page.
- A Log out control clears the local session and returns to the introduction page.
- Each account receives a unique referral code and referral URL.

**Security note:** this is still a static GitHub Pages prototype. Account credentials and referral records are stored in the browser's localStorage and are not suitable for real production authentication. A real deployment needs a secure backend, password hashing, sessions/tokens, database storage, email/account recovery, rate limiting, and proper authorization.

## Final reward schedule
- Daily reward cycle: **12:00 AM IST (Asia/Kolkata)** every day.
- Reward rate: **0.5% of staked BMX per daily cycle** in the website preview.
- Rewards are local browser simulation, not blockchain rewards.
- Admin preview wallet: **0x7f3a...9c2e** starts with 1,000,000,000 BMX; other preview wallets start at 0 in a fresh browser state.
- Transfers are website-only records and do not send blockchain tokens.

## Authentication UI

- Protected pages include a visible **Log out** button in the top navigation.
- Logging out clears the browser-local session and returns to `index.html`.

## Status notifications

The interface now shows clear success/error-style status popups for actions such as sign in, sign up, saving, staking, and sending transfers.
