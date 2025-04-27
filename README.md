# Discord System Bot

A Discord bot with Nord theme embed colors, system commands, and fun commands.

## Features
- Commands styled with Nord theme embed colors.
- System commands like `/ban`, `/unban`, `/kick`, `/mute`, `/unmute`, `/warn`, `/remove-warn`, and more.
- Fun commands and utilities.
- Auto-role assignment.
- Role-based staff command system.
- Ticket system with options to open, close, claim, and generate transcripts for tickets.

## Setup

1. Clone this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your bot token and client ID:
   ```env
   BOT_TOKEN=YOUR_BOT_TOKEN
   CLIENT_ID=YOUR_CLIENT_ID
   ```
4. Configure the bot settings in `config.json`.
5. Start the bot:
   ```bash
   npm start
   ```

## Commands

### System Commands
- `/ban <user>`: Ban a user.
- `/unban <user>`: Unban a user.
- `/kick <user>`: Kick a user.
- `/mute <user>`: Mute a user.
- `/unmute <user>`: Unmute a user.
- `/warn <user>`: Warn a user.
- `/remove-warn <user>`: Remove a warning from a user.

### Fun Commands
- `/joke`: Get a random joke.
- `/meme`: Fetch a random meme.
- `/8ball`: Ask the magic 8-ball a question.

### Utility Commands
- `/autorole <role>`: Set an auto-role for new members.
- `/remind <time> <unit> <reminder>`: Set a reminder.
- `/quote`: Get a random inspirational quote.
- `/weather <city>`: Get the current weather for a city.

### Ticket System
- `/ticket-panel`: Create a ticket panel for users to open tickets.
  - Options: Close, Claim, Generate Transcript (if enabled in `config.json`).

## Developed By
ix1g
