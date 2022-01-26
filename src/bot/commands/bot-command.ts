import { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { BotCommandPermissions } from './bot-command-permissions.js';

/**
 * Used to create slash-commands for the bot.
 */
export interface BotCommand {
  /**
   * ApplicationCommandData for the creation of this command.
   */
  commandData: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;

  /**
   * The logic to execute when this command is called.
   * @param interaction The Interaction associated with the call of this command.
   */
  execute: (interaction: CommandInteraction) => Promise<void>;

  /**
   * Permissions for use of this command.
   */
  permissions?: BotCommandPermissions[];
}
