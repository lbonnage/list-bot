import { ApplicationCommandData, Client, Interaction } from 'discord.js';
import { BotCommandPermissions } from './bot-command-permissions.js';

/**
 * Used to create slash-commands for the bot.
 */
export interface BotCommand {
  /**
   * ApplicationCommandData for the creation of this command.
   */
  commandData: ApplicationCommandData;

  /**
   * The logic to execute when this command is called.
   * @param client The Discord Client of the bot.
   * @param interaction The Interaction associated with the call of this command.
   */
  execute: (client: Client, interaction: Interaction) => void;

  /**
   * Permissions for use of this command.
   */
  permissions?: BotCommandPermissions[];
}
