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

## Key Notes
- Node.js 16.x required
- Facebook account credentials (email/password or cookies) must be configured in `config.json`
- Dashboard is disabled by default (`dashBoard.enable: false` in config.json)
- Uses SQLite for local database storage by default
- npm start scripts fixed from Windows-style (`set NODE_ENV=`) to Linux-compatible (`NODE_ENV=`)
