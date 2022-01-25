import 'dotenv/config';

import { Bot } from './bot/bot.js';
import { Logger } from './lib/logger.js';

import { database } from './bot/database/models/index.js';

const logger = Logger('app');

// Retrieve environment variables.
let token: string;
if (process.env.BOT_TOKEN) {
  token = process.env.BOT_TOKEN;
} else {
  logger.error(`Unable to retrieve BOT_TOKEN from environment.`);
  throw new Error('Unable to retrieve BOT_TOKEN from environment.');
}
let clientId: string;
if (process.env.CLIENT_ID) {
  clientId = process.env.CLIENT_ID;
} else {
  logger.error(`Unable to retrieve CLIENT_ID from environment.`);
  throw new Error('Unable to retrieve CLIENT_ID from environment.');
}
let prefix: string;
if (process.env.PREFIX) {
  prefix = process.env.PREFIX;
} else {
  logger.error(`Unable to retrieve PREFIX from environment.`);
  throw new Error('Unable to retrieve PREFIX from environment.');
}

// Authenticate the database.
database
  .authenticate()
  .then(() => logger.info('Database connection has been successfully authenticate.'))
  .catch((error) => logger.error(`Failed to authenticate database connection: ${error}.`));

// Create and start the bot.
const bot = new Bot(token, clientId, prefix);

bot
  .login()
  .then(() => {
    logger.info(`Logged in.`);
    bot.init();
  })
  .catch((error) => {
    logger.error(`Failed to login: ${error}`);
  });
