import { Client, Interaction, Snowflake } from 'discord.js';
import { ApplicationCommandPermissionType } from 'discord-api-types';
import { BotCommand } from './bot-command.js';
import { Logger } from '../../lib/logger.js';

const logger = Logger('list');

function execute(client: Client, interaction: Interaction): void {
  logger.info(`Executing List command on client ${client.token} with interaction ${JSON.stringify(interaction)}`);
}

/**
 * The List command for the server.  Allows access to and control of The List.
 * Todo:
 *  - Option to add people to The List (can add them more than once, keeps track of count and announces it, custom messages on certain numbers (69, 10, 100, etc)
 *  - Option to see how many times someone has been added to The List)
 *  - Option to ask what The List is (and the response should make fun of them ('You don't know The List?')
 */
export const List: BotCommand = {
  commandData: {
    defaultPermission: false,
    description: 'The List.',
    name: 'list',
  },
  execute,
  permissions: [
    {
      guildId: process.env.LIAMS_SERVER_GUILD_ID as Snowflake,
      permissions: [
        {
          id: process.env.WEEB_ROLE_ID as Snowflake,
          type: ApplicationCommandPermissionType.ROLE,
          permission: true,
        },
      ],
    },
  ],
};
