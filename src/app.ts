import 'dotenv/config';

import { Bot } from './bot/bot.js';
import { Logger } from './lib/logger.js';

const logger = Logger('app');

// Retrieve environment variables.
let token: string;
if (process.env.BOT_TOKEN) {
  token = process.env.BOT_TOKEN;
} else {
  logger.error(`Unable to retrieve BOT_TOKEN from environment.`);
  throw new Error('Unable to retrieve BOT_TOKEN from environment.');
}
let prefix: string;
if (process.env.PREFIX) {
  prefix = process.env.PREFIX;
} else {
  logger.error(`Unable to retrieve PREFIX from environment.`);
  throw new Error('Unable to retrieve PREFIX from environment.');
}

// Create and start the bot.
const bot = new Bot(token, prefix);

bot
  .login()
  .then(() => {
    logger.info(`Logged in.`);
    bot.init();
  })
  .catch((error) => {
    logger.error(`Failed to login: ${error}`);
  });
