import { Client } from 'discord.js';

/**
 * Represents a message command.
 */
export interface BotMessage {
  /**
   * The logic to execute when this command is called.
   * @param client The Discord Client of the bot.
   */
  execute: (client: Client) => void;
}
