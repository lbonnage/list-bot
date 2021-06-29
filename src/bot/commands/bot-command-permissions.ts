import { ApplicationCommandPermissionData, Snowflake } from 'discord.js';

/**
 * Used to control permissions of a slash-command.
 */
export interface BotCommandPermissions {
  /**
   * The guild these permissions should apply to.
   */
  guildId: Snowflake;

  /**
   * The ApplicationCommandPermissionData of this command.
   */
  permissions: ApplicationCommandPermissionData[];
}
