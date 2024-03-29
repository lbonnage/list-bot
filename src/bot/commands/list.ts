import * as fs from 'fs';

import { CommandInteraction, CommandInteractionOption, Message, MessageAttachment, Snowflake, User as DiscordUser } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { BotCommand } from './bot-command.js';
import { User } from '../database/models/user.model.js';
import { ListEntry, ListEntryType } from '../database/models/list-entry.model.js';
import { Logger } from '../../lib/logger.js';
import { ApplicationCommandPermissionTypes } from 'discord.js/typings/enums';

const logger = Logger('list');

const listString = `**The List** ${process.env.THE_LIST_EMOJI}`;

/**
 * The commands associated with the list command.
 */
enum ListCommand {
  LIST = 'list',
  ADD = 'add',
  REMOVE = 'remove',
  CHECK = 'check',
  HELP = 'help',
  USER = 'user',
  REASON = 'reason',
}

/**
 * Message to send when someone has been added to The List a certain number of times.
 */
const specialCounts: Map<number, string> = new Map([
  [42, 'haha.'],
  [69, 'nice.'],
  [404, 'Server reset incoming.'],
  [489, 'https://i.redd.it/pakxnxjsbos51.jpg'],
  [420, 'very nice.'],
  [789, 'Very scary.'],
  [911, 'Too soon.'],
  [9000, 'Too early.'],
  [9001, 'There we go.'],
]);

/**
 * Attempts to add a user to The List.
 * @param interaction The interaction object created by the command.
 * @param userDiscord The user to be added to The List.
 * @param callerDiscord The user who called the command.
 * @param reason The reason they are being added to The List.
 */
async function onAdd(
  interaction: CommandInteraction,
  userDiscord: DiscordUser,
  callerDiscord: DiscordUser,
  reason: string,
): Promise<void> {
  // First, you must check to see if the user you are adding exists in the database.
  // If they don't exist, you must add them to the database.
  const user: User = await User.FindOrCreate(userDiscord.id);
  // Second, you must do the same for the caller.
  const caller: User = await User.FindOrCreate(callerDiscord.id);

  const userId: number = user.getDataValue('id');

  // Finally, now that you have the required information, you can add the entry to The List.
  await ListEntry.create({
    entry: userId,
    entryType: ListEntryType.USER,
    timeAdded: new Date(),
    addedBy: caller.getDataValue('id'),
    reason,
  }).catch((error) => {
    logger.error(`Failed adding new list entry: ${error}.`);
    interaction.reply({
      content: `Failed to add ${userDiscord} to ${listString}.`,
      ephemeral: true,
    });
  });

  let content;
  if (reason === undefined) {
    content = `Added ${userDiscord} to ${listString}.`;
  } else {
    content = `Added ${userDiscord} to ${listString} with reason: '${reason}'.`;
  }

  await interaction.reply({
    content,
    ephemeral: false,
  });

  // As an added step, check how many times the added user is on The List.  At certain counts, make a special announcement.
  await ListEntry.count({ where: { entry: userId } }).then((count) => {
    if (specialCounts.has(count)) {
      interaction.followUp({
        content: `${userDiscord} has been added to ${listString} *${count}* times.  ${specialCounts.get(count)}`,
        ephemeral: false,
      });
    }
  });
}

/**
 * Checks a user's presence on The List.
 * @param interaction The interaction object created by the command.
 * @param userDiscord The user to check on The List.
 */
async function onCheck(interaction: CommandInteraction, userDiscord?: DiscordUser) {
  // There are two different calls here: If a user is specified, simply check how many times the user is on The List, and return their most recent entry.
  // If a user is not specified, you need to provide an upload of The List.

  if (userDiscord) {
    // We must create a string containing all entries for this user in The List.
    let paste = '';

    // First, you must check to see if the user you are adding exists in the database.
    // If they don't exist, you must add them to the database.
    const user: User = await User.FindOrCreate(userDiscord.id);
    const userId: number = user.getDataValue('id');

    // Second, create a map mapping from user ID to current Discord name, to efficiently list users who are on The List multiple times.
    const idToName: Map<number, string> = new Map();
    const users: User[] = await User .findAll();

    for (const user of users) {
      await interaction.client.users.fetch(user.getDataValue('discordId') as Snowflake).then((retrievedUser) => {
        idToName.set(user.getDataValue('id'), `@${retrievedUser.username}#${retrievedUser.discriminator}`);
      });
    }

    // Third, retrieve all entries for this user to The List and then construct the string for each.
    const listEntries: ListEntry[] = await ListEntry.findAll({where: {entry: userId}});
    listEntries.forEach((listEntry: ListEntry, index: number) => {
      const entryName: string = idToName.get(listEntry.getDataValue('entry')) as string;
      const submitterName: string = idToName.get(listEntry.getDataValue('addedBy')) as string;
      const timeAdded: Date = listEntry.getDataValue('timeAdded');
      const reason: string = listEntry.getDataValue('reason');

      paste += `${
        index + 1
      }.\t${entryName}\t\tAdded by: ${submitterName}\t\tReason: ${reason}\t\tTime added: ${timeAdded.toLocaleString(
        'en-US',
      )}\n`;
    });

    fs.writeFileSync('./list.txt', paste);
    await interaction.reply({files: [new MessageAttachment('./list.txt')]});
  } else {
    // We must create a string containing all entries to The List.
    let paste = '';

    // First, create a map mapping from user ID to current Discord name, to efficiently list users who are on The List multiple times.
    const idToName: Map<number, string> = new Map();
    const users: User[] = await User .findAll();

    for (const user of users) {
      await interaction.client.users.fetch(user.getDataValue('discordId') as Snowflake).then((retrievedUser) => {
        idToName.set(user.getDataValue('id'), `@${retrievedUser.username}#${retrievedUser.discriminator}`);
      });
    }    

    // Second, retrieve all entries to The List and then construct the string for each.
    const listEntries: ListEntry[] = await ListEntry.findAll();
    listEntries.forEach((listEntry: ListEntry, index: number) => {
      const entryName: string = idToName.get(listEntry.getDataValue('entry')) as string;
      const submitterName: string = idToName.get(listEntry.getDataValue('addedBy')) as string;
      const timeAdded: Date = listEntry.getDataValue('timeAdded');
      const reason: string = listEntry.getDataValue('reason');

      paste += `${
        index + 1
      }.\t${entryName}\t\tAdded by: ${submitterName}\t\tReason: ${reason}\t\tTime added: ${timeAdded.toLocaleString(
        'en-US',
      )}\n`;
    });

    fs.writeFileSync('./list.txt', paste);
    await interaction.reply({files: [new MessageAttachment('./list.txt')]});

  }
}

async function execute(interaction: CommandInteraction): Promise<void> {
  logger.info(`Executing List command.}`);

  const callerDiscord: DiscordUser = interaction.user;
  let value: CommandInteractionOption;
  let userDiscord: DiscordUser;
  let reason: string;
  switch (interaction.options.getSubcommand()) {
    case ListCommand.ADD:
      value = interaction.options.get(ListCommand.ADD) as CommandInteractionOption;
      logger.info(`List ${ListCommand.ADD} command called with value: ${JSON.stringify(value)}`);

      userDiscord = interaction.options.getUser(ListCommand.USER) as DiscordUser;
      reason = interaction.options.getString(ListCommand.REASON) as string;

      await onAdd(interaction, userDiscord, callerDiscord, reason);

      break;
    case ListCommand.REMOVE:
      value = interaction.options.get(ListCommand.REMOVE) as CommandInteractionOption;
      logger.info(`List ${ListCommand.REMOVE} command called with value: ${JSON.stringify(value)}`);

      userDiscord = interaction.options.getUser(ListCommand.USER) as DiscordUser;


      await onAdd(interaction, callerDiscord, callerDiscord, 'Tried to remove someone from The List.');

      break;
    case ListCommand.CHECK:
      value = interaction.options.get(ListCommand.CHECK) as CommandInteractionOption;
      logger.info(`List ${ListCommand.CHECK} command called with value: ${JSON.stringify(value)}`);

      userDiscord = interaction.options.getUser(ListCommand.USER) as DiscordUser;

      if (userDiscord !== undefined) {
        await onCheck(interaction, userDiscord);
      } else {
        await onCheck(interaction);
      }

      break;
    case ListCommand.HELP:
      value = interaction.options.get(ListCommand.HELP) as CommandInteractionOption;
      logger.info(`List ${ListCommand.HELP} command called with value: ${JSON.stringify(value)}`);

      await onAdd(interaction, callerDiscord, callerDiscord, `Didn't know about The List.`).then(() => {
        interaction.followUp({
          content: `This guy ${callerDiscord} doesn't know about ${listString}.`,
          ephemeral: false,
        });
      });

      break;
    default:
      logger.error(`Unrecognized List Command: ${interaction.commandName}.`);
      await interaction.reply({
        content: `Unknown command.`,
        ephemeral: true,
      });
  }
}

const listCommand = new SlashCommandBuilder()
  .setName(ListCommand.LIST)
  .setDescription('The List')
  .addSubcommand(subcommand => 
    subcommand
      .setName(ListCommand.ADD)
      .setDescription('Add an entry to The List.')
      .addUserOption(option => 
        option
          .setName(ListCommand.USER)
          .setDescription('The user to add to The List.')
          .setRequired(true)
        )
      .addStringOption(option => option
          .setName(ListCommand.REASON)
          .setDescription('The reason this user was added to The List.')
          .setRequired(false)
        )
    )
  .addSubcommand(subcommand => 
    subcommand
      .setName(ListCommand.REMOVE)
      .setDescription('Remove an entry from The List.')
      .addUserOption(option => 
        option
          .setName(ListCommand.USER)
          .setDescription('The user to remove the latest entry of from The List.')
          .setRequired(true)
        )
      )
  .addSubcommand(subcommand => 
    subcommand
      .setName(ListCommand.CHECK)
      .setDescription('Check The List.  If a user is not specified, returns an upload of The List.')
      .addUserOption(option => 
        option
          .setName(ListCommand.USER)
          .setDescription("Check a specific user's presence on The List.")
          .setRequired(false)
        )
    )
  .addSubcommand(subcommand =>
    subcommand
      .setName(ListCommand.HELP)
      .setDescription("Explain The List.")
    )

/**
 * The List command for the server.  Allows access to and control of The List.
 */
export const List: BotCommand = {
  commandData: listCommand,
  execute,
  permissions: [
    {
      guildId: process.env.LIAMS_SERVER_GUILD_ID as Snowflake,
      permissions: [
        {
          id: process.env.MEMBER_ROLE_ID as Snowflake,
          type: ApplicationCommandPermissionTypes.ROLE,
          permission: true,
        },
      ],
    },
  ],
};
