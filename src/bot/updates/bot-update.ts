import { Client } from 'discord.js';

/**
 * Used to update things on an interval.
 */
export interface BotUpdate {
  /**
   * The logic to execute when this update is called.
   */
  execute: (client: Client) => Promise<void>;

  /**
   * The interval to run the update on in milliseconds.
   */
  interval: number;
}