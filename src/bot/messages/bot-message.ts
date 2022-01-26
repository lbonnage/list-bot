import { Bot } from "../bot";
/**
 * Represents a message command.
 */
export interface BotMessage {
  /**
   * The logic to execute when this command is called.
   * @param bot The Discord bot.
   */
  execute: (bot: Bot) => void;
}
