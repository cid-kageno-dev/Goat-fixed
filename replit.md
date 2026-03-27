# Goat Bot V2

## Overview
A Facebook Messenger chatbot built with Node.js. Based on the open-source [Goat-Bot-V2](https://github.com/ntkhang03/Goat-Bot-V2) project by NTKhang.

## Architecture
- **Entry point**: `index.js` — spawns `Goat.js` as a child process and handles restarts
- **Main bot logic**: `Goat.js` — handles Facebook login, command loading, event handling
- **Bot handlers**: `bot/` — login logic, event handlers, custom scripts
- **Dashboard**: `dashboard/` — Express-based web dashboard (disabled by default)
- **Database**: SQLite (default), with optional MongoDB support
- **Facebook API**: Uses `fb-chat-api` local module and `nexus-fca`/`dhoner-fca` packages

## Configuration
- `config.json` — main bot configuration (Facebook credentials, prefix, admin IDs, database type, etc.)
- `fca-config.json` — FCA (Facebook Chat API) options (auto-update, MQTT settings)

## Running
- Start command: `node index.js`
- The workflow "Start application" runs `npm install && node index.js`

## Docker
- `Dockerfile` — builds the bot using `node:20-slim` with all required native libraries (cairo, pango, libjpeg, etc. for the `canvas` module)
- `.dockerignore` — excludes `node_modules`, git files, docs, and temp directories from the image
- Build: `docker build -t goat-bot .`
- Run: `docker run -it goat-bot`
- Port `3001` is exposed for the dashboard (disabled by default in `config.json`)

## Key Notes
- Node.js 20.x (upgraded from 16.x for dependency compatibility)
- Facebook account credentials (email/password or cookies) must be configured in `config.json`
- Dashboard is disabled by default (`dashBoard.enable: false` in config.json)
- Uses SQLite for local database storage by default
- npm start scripts fixed from Windows-style (`set NODE_ENV=`) to Linux-compatible (`NODE_ENV=`)
