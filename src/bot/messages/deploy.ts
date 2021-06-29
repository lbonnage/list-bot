import { Client } from 'discord.js';
import { BotMessage } from './bot-message';
import { BotCommand } from '../commands/bot-command';
import { Logger } from '../../lib/logger';

import * as commands from '../commands';

function execute(client: Client): void {
  logger.info(`Deploy called.`);

  // First, wipe any commands that currently exist.
  client.application?.commands.set([]);

  // Second, iterate through all commands and create them.
  Object.values(commands).forEach((command: BotCommand) => {
    logger.info(`Adding command: ${command.commandData.name}.`);
    client.application?.commands
      .create(command.commandData)
      .then((createdCommand) => {
        logger.info(`Successfully added command: ${createdCommand.name}.`);

        // If necessary, fine-tune permissions for the command on individual guilds.
        command.permissions?.forEach((botPermission) => {
          logger.info(`Setting permissions for command '${createdCommand.name}' in guild ${botPermission.guildId}.`);
          createdCommand
            .setPermissions(botPermission.permissions, botPermission.guildId)
            .then(() => {
              logger.info(
                `Successfully set permissions for command '${createdCommand.name}' in guild ${botPermission.guildId}.`,
              );
            })
            .catch((error) => {
              logger.error(
                `Failed to set permissions for command '${createdCommand.name}' in guild ${botPermission.guildId} with error: ${error}.`,
              );
            });
        });
      })
      .catch((error) => {
        logger.error(`Failed to add Command '${command.commandData.name}' with error: ${error}.`);
      });
  });
}

/**
 * Deploy command sets all of the slash commands for the bot.
 */
export const Deploy: BotMessage = {
  execute,
};

const logger = Logger('deploy');
