# SMG Hackathon — Lyrics & Chords App

A web app for discovering songs and sharing chord sheets with friends.

## What it does

**Search** — Find songs, albums, and artists powered by the iTunes API.

**Song pages** — Click any song to open its detail page with artwork, title, artist, and album info.

**Playlists** — Create playlists, add songs to them, and navigate between songs with Previous / Next buttons.

**Collaboration** — Invite friends to a playlist. Collaborators can browse and contribute to the same playlist. Owners get notified when someone leaves.

**Chords** — Each song supports user-submitted chord sheets. Multiple versions can coexist — one per user — sorted by likes. Anyone can add their own version; others can like it.

**People** — Search for other users by username and view their profiles.

**Notifications** — In-app feed for playlist invitations and collaborator activity.

**Auth** — Sign in with Google.

## Stack

Next.js 15 · TypeScript · Tailwind CSS · Firebase (Auth + Firestore) · iTunes Search API

## Run locally

```bash
npm install
npm run dev
```
