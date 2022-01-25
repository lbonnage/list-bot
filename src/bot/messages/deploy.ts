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

  const commandsJSON: RESTPostAPIApplicationCommandsJSONBody[] = []
  Object.values(commands).forEach((command: BotCommand) => {
    logger.info(`Adding command: ${command.commandData.name}.`);
    commandsJSON.push(command.commandData.toJSON());
  })

  const rest = new REST({version: '9'}).setToken(bot.token);

  (async () => {
    try {
      await rest.put(Routes.applicationCommands(bot.clientId as `${bigint}`), { body: commandsJSON });
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
