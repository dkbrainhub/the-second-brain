---
title: BrainRush Hosting Guide
sidebar_position: 1
displayed_sidebar: technologySidebar
tags:
  - mobile
  - hosting
  - deployment
  - android
  - expo
  - google-play
  - supabase
description: Complete guide to hosting and deploying a mobile app using Expo, EAS Build, and Google Play Store.
---

# BrainRush – Complete App Hosting & Deployment Guide

> Everything discussed — from understanding how a mobile app works, to accounts,
> setup, building, and submitting to Google Play Store.
> Written for a first-time app builder with no prior publishing experience.

---

## First — Understand How a Mobile App Works

BrainRush is a **mobile app, not a website**. There is no UI to host on any server.
This is the full picture of how everything connects:

```
Your Code (on your laptop)
        ↓
EAS Build Service (expo.dev compiles it in the cloud)
        ↓
Google Play Store (distributes it to users)
        ↓
User's Android Phone (the UI lives here — not on any server)
        ↕
Supabase (your database, auth, storage — hosted at supabase.com)
```

You never configure a server. You never buy a VPS. You never set up Nginx.
The app UI lives on the user's phone. Supabase is already hosted for you.
The only thing EAS does is compile your code into a file Android can install.

---

## Table of Contents

1. [Accounts You Need](#1-accounts-you-need)
2. [Set Up Your Computer](#2-set-up-your-computer)
3. [Set Up Supabase](#3-set-up-supabase)
4. [Set Up Google Sign-In](#4-set-up-google-sign-in)
5. [Set Up Anthropic API](#5-set-up-anthropic-api)
6. [Set Up RevenueCat](#6-set-up-revenuecat)
7. [Set Up PostHog Analytics](#7-set-up-posthog-analytics)
8. [Configure Environment Variables](#8-configure-environment-variables)
9. [Generate Your First Cards](#9-generate-your-first-cards)
10. [Test the App on Your Phone](#10-test-the-app-on-your-phone)
11. [Push Code to Bitbucket](#11-push-code-to-bitbucket)
12. [Build the Android APK](#12-build-the-android-apk)
13. [Submit to Google Play Store](#13-submit-to-google-play-store)
14. [After Launch — What to Watch](#14-after-launch--what-to-watch)
15. [Full Infrastructure Summary](#15-full-infrastructure-summary)
16. [Quick Reference Commands](#16-quick-reference-commands)

---

## 1. Accounts You Need

Create all of these before touching any code. Some take time to verify.

### Expo — Free
- Go to **expo.dev** and sign up
- This service builds your Android APK in the cloud
- You do not need Android Studio or Java installed on your computer
- No credit card needed

### Supabase — Free
- Go to **supabase.com** and sign up
- This is your entire backend — database, user authentication, and file storage
- Free tier supports up to 50,000 monthly active users
- No credit card needed

### Google Play Console — $25 one-time fee
- Go to **play.google.com/console** and register
- This is where your app lives so Android users can download it
- Pay the one-time $25 developer registration fee
- **Do this first** — Google takes 24 to 48 hours to verify new accounts

### Anthropic — Pay as you go
- Go to **console.anthropic.com** and sign up
- Used only by your local card generation pipeline script
- Never runs inside the app itself
- Add $5 credit — enough to generate over 1,000 cards
- Generating 100 cards costs approximately Rs 10 to Rs 15

### Bitbucket — Free
- Go to **bitbucket.org** and sign up
- Free unlimited private repositories
- Where your code is safely backed up in the cloud

### RevenueCat — Free to start
- Go to **revenuecat.com** and sign up
- Handles all subscription billing and in-app purchase complexity
- Completely free until you reach $2,500 monthly revenue

### PostHog — Free
- Go to **posthog.com** and sign up
- Tracks how users use your app — retention, events, funnels
- Free tier is more than enough for early growth

---

## 2. Set Up Your Computer

### Install Node.js
1. Go to **nodejs.org**
2. Download the **LTS version** — the one that says Recommended for most users
3. Install it normally like any application
4. Verify it worked by opening your terminal and running:

```bash
node --version
# Should show something like v20.11.0
```

### Install VS Code
1. Go to **code.visualstudio.com** and download it
2. Install it — this is your code editor for all development

### Install EAS CLI
Open your terminal and run:

```bash
npm install --global eas-cli

# Verify it installed
eas --version
```

### Set up the BrainRush project
1. Unzip the `brainrush.zip` file you downloaded
2. Open VS Code
3. File → Open Folder → select the brainrush folder
4. Open the terminal inside VS Code (View → Terminal)
5. Run:

```bash
npm install
# Downloads all project libraries — takes 2 to 3 minutes
```

---

## 3. Set Up Supabase

### Step 1 — Create your project
1. Log into supabase.com
2. Click **New project**
3. Fill in:
   - Name: `brainrush`
   - Database password: generate a strong one and save it somewhere safe
   - Region: choose the one closest to your users
     - For India choose **ap-south-1 (Mumbai)**
4. Click **Create new project** — takes about 2 minutes to provision

### Step 2 — Get your API keys
1. Go to **Settings → API**
2. Copy these three values — you will paste them into your `.env` file shortly:

| Key Name | Environment Variable | Notes |
|---|---|---|
| Project URL | EXPO_PUBLIC_SUPABASE_URL | Safe to include in app |
| anon / public key | EXPO_PUBLIC_SUPABASE_ANON_KEY | Safe to include in app |
| service_role key | SUPABASE_SERVICE_KEY | Secret — pipeline only, never in app |

### Step 3 — Run the database schema
1. Go to **SQL Editor → New query**
2. Open the file `supabase/schema.sql` from your project folder in VS Code
3. Copy the entire contents
4. Paste into the Supabase SQL editor
5. Click **Run**
6. You should see: Success. No rows returned.

This creates four tables:
- `cards` — stores all educational cards
- `user_interactions` — tracks likes, saves, skips, shares, reads
- `user_topic_weights` — powers personalization
- `user_streaks` — tracks daily streaks

### Step 4 — Enable Row Level Security
1. Go to **Authentication → Policies**
2. Confirm all four tables show policies listed under them
3. If any table shows no policies, re-run the second section of schema.sql

RLS means users can only read and write their own data.
Without this, any user could read every other user's data.

### Step 5 — Configure Authentication
1. Go to **Authentication → Providers**
2. **Email** — confirm it is toggled ON (default)
3. **Google** — toggle ON (you will fill in credentials in Step 4 of this guide)
4. Go to **Authentication → URL Configuration**
5. Under Redirect URLs add both of these:
```
exp://localhost:8081
brainrush://
```
6. Click Save

### Step 6 — Create Storage bucket
1. Go to **Storage → New bucket**
2. Name: `avatars`
3. Toggle: Public
4. Click Create bucket

This is for user profile photos — optional for MVP but good to have ready.

### Supabase Free Tier — What to Know

| Resource | Free Limit | Reality |
|---|---|---|
| Database storage | 500 MB | Holds millions of cards and interactions |
| Bandwidth | 5 GB/month | Enough for early growth |
| Monthly active users | 50,000 | Upgrade only when you hit this |
| Inactivity pause | After 1 week of no traffic | Just click unpause in dashboard |

**The free tier comfortably handles your entire MVP and early user growth.**
Upgrade to Pro ($25/month) only when you approach 50,000 monthly active users.

---

## 4. Set Up Google Sign-In

Google Sign-In lets users log in with one tap using their Google account.
This requires both a Google Cloud project and connecting it to Supabase.

### Step 1 — Create a Google Cloud project
1. Go to **console.cloud.google.com**
2. Click **Select a project → New Project**
3. Name it `BrainRush`
4. Click Create

### Step 2 — Configure OAuth consent screen
1. Go to **APIs & Services → OAuth consent screen**
2. User type: **External** → Click Create
3. Fill in:
   - App name: `BrainRush`
   - User support email: your email address
   - Developer contact email: your email address
4. Click Save and Continue through all remaining steps
5. No need to add scopes or test users at this stage

### Step 3 — Get your SHA-1 fingerprint
Android requires a SHA-1 fingerprint to verify your app is genuine.
Run this in your project terminal:

```bash
eas login
# Enter your Expo email and password

eas credentials --platform android
# Copy the SHA1 fingerprint value shown
```

### Step 4 — Create OAuth credentials
1. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
2. First create the **Android client**:
   - Application type: Android
   - Package name: `com.brainrush.app`
   - SHA-1 certificate fingerprint: paste the value from Step 3
   - Click Create
3. Then create the **Web application client**:
   - Application type: Web application
   - Click Create
   - Copy the **Client ID** and **Client Secret** — you need these for Supabase

### Step 5 — Connect Google to Supabase
1. In Supabase go to **Authentication → Providers → Google**
2. Toggle Enable
3. Paste the Web Client ID and Web Client Secret from Step 4
4. Copy the **Callback URL** shown — it looks like:
   `https://xxxxxxxxxxxx.supabase.co/auth/v1/callback`
5. Go back to Google Cloud → your Web OAuth credential
6. Under Authorised redirect URIs add the Supabase callback URL
7. Save in both Google Cloud and Supabase

### Step 6 — Add to .env file
```bash
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
```

---

## 5. Set Up Anthropic API

This powers your card generation pipeline.
It runs on your laptop only — it is never called from inside the app.

### Steps
1. Go to **console.anthropic.com** and sign up
2. Go to **API Keys → Create Key**
3. Name it `brainrush-pipeline`
4. Copy the key — it starts with `sk-ant-`
5. Go to **Billing → Add payment method**
6. Add $5 credit to start

### Add to .env file
```bash
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
```

### Cost Reference

| Action | Approximate Cost |
|---|---|
| Generate 100 cards | Rs 10 to Rs 15 |
| Initial 500-card library | Under Rs 50 |
| Weekly content refresh | Under Rs 20 |

Model used: `claude-haiku-4-5-20251001` — the fastest and cheapest Claude model,
perfectly suited for structured card generation at scale.

---

## 6. Set Up RevenueCat

RevenueCat handles all the complexity of Google Play subscriptions.
Without it you would need to directly implement Google Play Billing APIs — very complex.
With it, the code is already written and in your project.

### Step 1 — Create account and project
1. Go to **revenuecat.com** and sign up
2. Click **+ New Project** → name it `BrainRush`
3. Add an **Android app** inside the project
4. Copy the **Android Public SDK Key**

### Step 2 — Add to .env file
```bash
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxxxxxxxxxxxxxxx
```

### Step 3 — Create subscription products in Google Play
1. Log into **play.google.com/console** → your app
2. Go to **Monetize → Subscriptions → Create subscription**
3. Create two subscriptions:

| Product Name | Product ID | Price |
|---|---|---|
| Pro Monthly | com.brainrush.pro.monthly | Rs 299/month |
| Pro Yearly | com.brainrush.pro.yearly | Rs 2,499/year |

### Step 4 — Connect Play Store to RevenueCat
1. In Google Play Console go to **Setup → API access**
2. Link to a Google Cloud project
3. Create a service account and download the JSON key file
4. In RevenueCat → your Android app → **Google Play** → upload the JSON file

### Step 5 — Create entitlement and offering
1. RevenueCat → **Entitlements → + New** → Name: `pro`
2. RevenueCat → **Offerings → + New** → Name: `default`
3. Attach both subscription products to the `default` offering
4. Link both products to the `pro` entitlement

RevenueCat is completely free until you earn $2,500 per month.
At that scale, their fee is a small percentage of revenue.

---

## 7. Set Up PostHog Analytics

PostHog tells you whether users are actually coming back and using the app.
Without analytics you are building blind.

### Steps
1. Go to **posthog.com** and sign up
2. Create a new project named `BrainRush`
3. Go to **Project Settings → Project API Key**
4. Copy the key

### Add to .env file
```bash
EXPO_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxx
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### Events Already Tracked in BrainRush

| Event | When It Fires |
|---|---|
| app_opened | Every cold open of the app |
| card_read | User spends more than 5 seconds on a card |
| card_liked | Like button tapped |
| card_shared | Share button tapped |
| card_saved | Save button tapped |
| topic_changed | Topic chip selected |
| paywall_viewed | Paywall screen appears |
| purchase_completed | Subscription confirmed |

### The Most Important Dashboard to Set Up

In PostHog go to **Insights → Retention** and configure:
- Cohort event: `app_opened`
- Retention event: `app_opened`

This gives you Day 1, Day 7, and Day 30 retention cohorts.

**Day 7 retention above 15% — you have a real product, push on growth.**
**Day 7 retention below 8% — fix the product before spending energy on growth.**

---

## 8. Configure Environment Variables

Create your `.env` file from the example:

```bash
cp .env.example .env
```

Open `.env` in VS Code and fill in every single value:

```bash
# ── Supabase ─────────────────────────────────────────────────
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# ── Google Sign-In ───────────────────────────────────────────
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com

# ── RevenueCat ───────────────────────────────────────────────
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_xxxxxxxxxxxxxxxx

# ── PostHog ──────────────────────────────────────────────────
EXPO_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxx
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# ── Pipeline only — NEVER prefix these with EXPO_PUBLIC_ ─────
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
```

### Critical Security Rule

Keys prefixed with `EXPO_PUBLIC_` are bundled into the app binary.
Anyone who downloads your app can technically read these values.
This is fine for the Supabase anon key, RevenueCat key, and PostHog key —
they are designed to be public-facing.

`SUPABASE_SERVICE_KEY` and `ANTHROPIC_API_KEY` must **never** have the `EXPO_PUBLIC_`
prefix. These are server secrets. If exposed, someone could delete your entire
database or rack up thousands of dollars in Anthropic API bills.

---

## 9. Generate Your First Cards

You need cards in your database before the app has anything to show.
Run the pipeline on your laptop:

```bash
npx tsx pipeline/generate-cards.ts
```

You will see output like this:

```
BrainRush Card Generator
Generating 100 cards...

[1/100] Your brain cannot tell the difference between a real memory...
[2/100] A day on Venus is longer than an entire year on Venus...
Rejected: Generic fact that fails quality check...
[3/100] Saving $5 a day from age 20 makes you a millionaire...

Done — 87 approved, 13 rejected.
Estimated cost: $0.18
```

Takes about 8 to 12 minutes for 100 cards.
Cost is under Rs 15.

### Verify cards were inserted
1. Go to Supabase → **Table Editor → cards**
2. You should see rows with `is_approved = true`
3. If the table is empty, check your `.env` has the correct `SUPABASE_SERVICE_KEY`

### Run this regularly
Run the pipeline every week to keep your content library fresh.
Users will notice if they see the same cards again.

---

## 10. Test the App on Your Phone

### Install Expo Go on your Android phone
1. Open the Play Store on your Android phone
2. Search for **Expo Go** and install it

### Start the development server
```bash
npm start
```

A QR code appears in your terminal.

### Load the app
1. Open the Expo Go app on your phone
2. Scan the QR code
3. The app loads on your phone in about 10 seconds

Every time you save a file in VS Code the app refreshes automatically on your phone.
This is your development loop — change code, save, see it immediately.

### Test Checklist
- Cards load and scroll vertically
- Topic chips at the top filter cards correctly
- Like button works and shows active state
- Save button works and shows active state
- Share button opens the share sheet
- Sign up with email creates an account
- Confirmation email arrives in inbox
- Sign in with email and password works
- Google Sign-In button works
- All four bottom tabs navigate correctly
- Profile screen shows correct name and email
- Sign out returns to the welcome screen

### Important Note About Expo Go
After adding Google Sign-In (a native module), Expo Go can no longer
test that specific feature. Build a development APK instead:

```bash
eas build --platform android --profile development
```

Download and install this APK on your phone.
It works exactly like Expo Go but includes all native modules.
Use this for all testing going forward.

---

## 11. Push Code to Bitbucket

Do this before building. If anything goes wrong during a build you want
your code safely backed up.

### Step 1 — Create a repository on Bitbucket
1. Log into bitbucket.org
2. Click the **+** icon → **Repository**
3. Repository name: `brainrush`
4. Access level: **Private**
5. Click **Create repository**

### Step 2 — Push your code
Open your terminal in the brainrush project folder and run:

```bash
git init
git add .
git commit -m "feat: initial BrainRush scaffold with auth, cards, quizzes"

# Replace with your actual Bitbucket URL shown after creating the repo
git remote add origin https://bitbucket.org/yourusername/brainrush.git
git push -u origin main
```

### Step 3 — Verify .env is not committed
```bash
git status
```

You should NOT see `.env` in the list.
If you do see it, run this immediately:

```bash
echo ".env" >> .gitignore
git rm --cached .env
git commit -m "fix: remove .env from version control"
git push
```

### Day-to-Day Workflow
Every time you make changes:
```bash
git add .
git commit -m "brief description of what you changed"
git push
```

That is all you need as a solo builder.

---

## 12. Build the Android APK

### Step 1 — Log in to EAS
```bash
eas login
# Enter your Expo account email and password
```

### Step 2 — Configure the build
```bash
eas build:configure
# Accept all prompts — this creates/updates eas.json
```

### Step 3 — Build a preview APK for testing
```bash
eas build --platform android --profile preview
```

What happens:
- EAS uploads your code to its cloud servers
- It compiles your React Native app into an Android APK
- Your laptop just waits — you do not need Android Studio
- Takes 10 to 15 minutes
- When done you get a download link in the terminal

Download the `.apk` file from that link.

### Step 4 — Install on your Android phone
1. Transfer the APK to your phone
   (WhatsApp to yourself, email, USB cable, Google Drive — any method works)
2. Open the APK file on your phone
3. Android will ask: **Allow installs from this source** → tap Allow
4. Install it
5. Open BrainRush and test thoroughly as a real user would

This preview build is the closest experience to what users will actually download.
Test everything again — auth, cards, quizzes, subscriptions in sandbox mode.

### Step 5 — Build the production AAB for Play Store
Once you are happy with testing:

```bash
eas build --platform android --profile production
```

This creates an `.aab` (Android App Bundle) file — the format Google Play requires.
The AAB is smaller and more optimised than an APK.
Download it when the build completes.

---

## 13. Submit to Google Play Store

### Step 1 — Create your app in Play Console
1. Log into play.google.com/console
2. Click **Create app**
3. Fill in:
   - App name: `BrainRush`
   - Default language: English (United States)
   - App or game: **App**
   - Free or paid: **Free**
4. Accept the developer program policies
5. Click **Create app**

### Step 2 — Complete the store listing
Go to **Store presence → Main store listing** and fill in:

**Short description (80 characters max):**
```
Learn something surprising every day. Cards, quizzes, streaks.
```

**Full description (4,000 characters max):**
Write 3 to 4 paragraphs covering:
- What BrainRush does
- Who it is for (ages 13 to 22)
- What topics it covers
- How the quiz and streak system works
- Why it is different from other learning apps

### Step 3 — Upload graphics

You need all of these before you can submit:

| Asset | Required Size | How to Make It |
|---|---|---|
| App icon | 512 x 512 PNG | Canva.com — free |
| Feature graphic | 1024 x 500 PNG | Canva.com — free |
| Phone screenshots | Minimum 2, maximum 8 | Screenshot from your phone |

For screenshots: scroll through the app on your phone and take screenshots
of the home feed, a quiz, the streaks screen, and the profile screen.

### Step 4 — Create a privacy policy
Google Play requires a privacy policy for all apps. Create one free:

1. Go to **app-privacy-policy-generator.firebaseapp.com**
2. Fill in your app name and your email
3. Toggle on: collects email addresses, uses analytics, uses third-party SDKs
4. Click Generate
5. Copy the generated policy text
6. Go to **sites.google.com** → create a free site → create a page → paste the policy
7. Publish the site and copy the URL
8. In Play Console go to **App content → Privacy policy** → paste the URL

### Step 5 — Complete content rating
1. Play Console → **Policy → App content → Content rating**
2. Click **Start questionnaire**
3. Select category: **Education**
4. Answer all questions honestly
   - BrainRush has no violence, sexual content, or user-generated content
5. Submit — you receive a rating immediately

### Step 6 — Submit the build

**Option A — Using EAS (recommended):**
```bash
eas submit --platform android
```

**Option B — Manual upload:**
1. Play Console → **Production → Releases → Create new release**
2. Click **Upload** and select your `.aab` file
3. Add release notes: `Initial launch of BrainRush — learn something new every day`
4. Click Save → Review release → Start rollout to Production

### Step 7 — Wait for Google's review
- First submission takes **1 to 7 days** for review
- You will receive an email when approved
- You will receive an email if they require changes
- If rejected, fix what they ask and resubmit — this is completely normal

---

## 14. After Launch — What to Watch

### Share it everywhere on day one
- Share the Play Store link in WhatsApp groups and family chats
- Post in Reddit communities: r/india, r/learnprogramming, r/teenagers, r/education
- Post on LinkedIn using the 3 to 4 line posts you prepared
- Share in relevant Discord servers and Telegram student groups
- Ask every early user to leave an honest review on the Play Store

### Ask the right questions from early users
Do not ask "do you like it?" — people will say yes to be polite.

Ask these specific questions instead:
- What confused you in the first 30 seconds?
- Did you feel like opening it again after you closed it?
- What would make you open this every single day?
- What felt unnecessary or annoying?

The answers to these four questions will tell you exactly what to fix.

### Metrics to track in PostHog

| Metric | What it tells you | Target |
|---|---|---|
| D1 retention | % who open app next day | Above 30% |
| D7 retention | % still using after 1 week | Above 15% |
| D30 retention | % still using after 1 month | Above 8% |
| Cards per session | How many cards read per visit | Above 5 |
| Quiz completion | Do users finish quizzes | Above 60% |

**D7 retention above 15% — the core loop works, focus on growth.**
**D7 retention below 8% — fix the product before growing.**

### Update the app every 2 weeks
```bash
# Generate fresh cards
npx tsx pipeline/generate-cards.ts

# Build new version
eas build --platform android --profile production

# Submit update
eas submit --platform android
```

Increment the version number in `app.json` before each update:
```json
"version": "1.0.1"
```

---

## 15. Full Infrastructure Summary

Every service that runs BrainRush and what it costs:

| Service | What it does | Monthly Cost |
|---|---|---|
| Supabase | Database, auth, storage | Free |
| Expo EAS | Builds APK and AAB in cloud | Free |
| Google Play Console | Distributes app to Android users | Rs 2,000 one-time only |
| Anthropic API | Generates educational cards | ~Rs 50 |
| RevenueCat | Handles subscription billing | Free |
| PostHog | User analytics and retention | Free |
| Bitbucket | Stores your code | Free |
| **Total monthly** | | **~Rs 50 per month** |

You can run BrainRush for under Rs 50 a month until you have thousands of paying users.
That is the extraordinary advantage of this tech stack.
Five years ago you would have needed a team and thousands of dollars a month
to run infrastructure for an app like this.

---

## 16. Quick Reference Commands

These are the commands you will type most often:

```bash
# ── Development ───────────────────────────────────────────────
npm start                                    # start dev server, scan QR with Expo Go

# ── Content ───────────────────────────────────────────────────
npx tsx pipeline/generate-cards.ts           # generate 100 new cards (~Rs 15)

# ── Credentials ───────────────────────────────────────────────
eas login                                    # log in to Expo account
eas credentials --platform android           # get SHA-1 for Google OAuth setup

# ── Building ──────────────────────────────────────────────────
eas build:configure                          # first-time setup only
eas build --platform android --profile development   # dev build with native modules
eas build --platform android --profile preview       # test APK for your phone
eas build --platform android --profile production    # AAB for Play Store

# ── Submitting ────────────────────────────────────────────────
eas submit --platform android                # submit to Google Play Store

# ── Code backup ───────────────────────────────────────────────
git add .                                    # stage all changes
git commit -m "describe what changed"        # save a snapshot
git push                                     # upload to Bitbucket
```

---

## Timeline Summary

| Days | What you are doing |
|---|---|
| Day 1 | Create all accounts, set up computer, run npm install |
| Day 2 | Set up Supabase, run schema, get API keys |
| Day 3 | Set up Google Sign-In, Anthropic, RevenueCat, PostHog |
| Day 4 | Fill in .env, generate first 100 cards, test locally |
| Day 5 to 14 | Build features, test on phone daily, fix bugs |
| Day 14 | Push to Bitbucket, build preview APK, test thoroughly |
| Day 15 | Build production AAB, create Play Store listing |
| Day 16 | Submit to Play Store |
| Day 17 to 23 | Wait for Google review (1 to 7 days) |
| Day 24+ | App is live — share, collect feedback, iterate |

**Two weeks of focused 2-hour daily sessions gets you to a live app on the Play Store.**

---

*BrainRush — Built with Expo, React Native, TypeScript, NativeWind, Supabase,
Claude Haiku, RevenueCat, and PostHog.*
