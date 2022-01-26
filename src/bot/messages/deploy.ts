import { RequestData, REST } from '@discordjs/rest';
import { RESTPostAPIApplicationCommandsJSONBody, Routes } from 'discord-api-types/v9';
import { BotMessage } from './bot-message.js';
import { BotCommand } from '../commands/bot-command.js';
import { Logger } from '../../lib/logger.js';
import { Bot } from '../bot.js';

import * as commands from '../commands/index.js';

const logger = Logger('deploy');

function execute(bot: Bot): void {
  logger.info(`Deploy called.`);

  const rest = new REST({version: '9'}).setToken(bot.token);

  // First, delete all guild commands.
  rest.get(Routes.applicationGuildCommands(bot.clientId as `${bigint}`, process.env.LIAMS_SERVER_GUILD_ID as `${bigint}`))
    .then(data => {
        const promises = [];
        // @ts-ignore
        for (const command of data) {
            const deleteUrl = `${Routes.applicationGuildCommands(bot.clientId as `${bigint}`, process.env.LIAMS_SERVER_GUILD_ID as `${bigint}`)}/${command.id}`;
            promises.push(rest.delete(deleteUrl as `/${string}`));
        }
        return Promise.all(promises);
    });
  logger.info('Successfully added commands.');
  
  // Second, add all commands.
  const commandsJSON: RESTPostAPIApplicationCommandsJSONBody[] = []
  Object.values(commands).forEach((command: BotCommand) => {
    logger.info(`Adding command: ${command.commandData.name}.`);
    commandsJSON.push(command.commandData.toJSON());
  });
  (async () => {
    try {
      await rest.put(Routes.applicationCommands(bot.clientId as `${bigint}`), { body: commandsJSON });
      // await rest.put(Routes.applicationGuildCommands(bot.clientId as `${bigint}`, process.env.LIAMS_SERVER_GUILD_ID as `${bigint}`), { body: commandsJSON });

      logger.info('Successfully added commands.');
    } catch (e) {
      logger.error(`Failed to add commands: ${e}`);
    }
  })();

}

/**
 * Deploy command sets all of the slash commands for the bot.
 */
export const Deploy: BotMessage = {
  execute,
};
