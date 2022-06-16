# List Bot
Discord bot for Liam's Server.

# Setup
## Initial setup
`git clone` an instance of the repository to a local directory.

## Environment
Create and complete a copy of `.env.example` and call it `.env`.  This file will contain environment variables specific to your instance of the bot.

## FAQ
___
 **Q**: `ERROR: Please install sqlite3 package manually`

 **A**: Try `npm i sqlite3 -D && rm -rf node_modules && npm i && npm rebuild`.  Answer found [here](https://github.com/sequelize/sequelize/issues/11174#issuecomment-509974511).
 ___