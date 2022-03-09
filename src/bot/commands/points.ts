import * as fs from 'fs';

import { CommandInteraction, CommandInteractionOption, Message, MessageAttachment, Snowflake, User as DiscordUser } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { BotCommand } from './bot-command.js';
import { User } from '../database/models/user.model.js';
import { PointsEntry, PointsEntryType } from '../database/models/points-entry.model.js';
import { Logger } from '../../lib/logger.js';
import { ApplicationCommandPermissionTypes } from 'discord.js/typings/enums';

const logger = Logger('points');

// TODO: At the end of the year, the bot should print out a ranking in the `Announcements` channel.
// TODO: After adjusting points, check to see if they are the new maximum or minimum in the rankings, then say a special message.

/**
 * Attempts to adjust a user's points.
 * @param interaction The interaction object created by the command.
 * @param userDiscord The user having their points adjusted.
 * @param callerDiscord The user who called the command.
 * @param value The value their points will be adjusted by.
 * @param reason The reason they are being added to The List.
 */
async function onAdjust(
  interaction: CommandInteraction,
  userDiscord: DiscordUser,
  callerDiscord: DiscordUser,
  value: number,
  reason: string,
): Promise<void> {

  // First, you must check to see if the user you are adjusting exists in the database.
  // If they don't exist, you must add them to the database.
  const user: User = await User.FindOrCreate(userDiscord.id);
  // Second, you must do the same for the caller.
  const caller: User = await User.FindOrCreate(callerDiscord.id);

  const userId: number = user.getDataValue('id');

  // Third, you must see if the user you are adjusting exists in the points table.
  // If they don't exist, you must create an entry for them.
  const pointsEntry: PointsEntry = await PointsEntry.FindOrCreate(userId);
  pointsEntry.value += value;
  await pointsEntry.save();

  let content;
  if (reason === undefined) {
    if (value > 0) {
      content = `${userDiscord} was awarded ${value} point(s) by ${callerDiscord}!  New total: ${pointsEntry.value}.`;
    } else {
      content = `${userDiscord} was deducted ${-1 * value} point(s) by ${callerDiscord}! New total: ${pointsEntry.value}.`;
    }
  } else {
    if (value > 0) {
      content = `${userDiscord} was awarded ${value} point(s) by ${callerDiscord}! New total: ${pointsEntry.value}. Reason: '${reason}'`;
    } else {
      content = `${userDiscord} was deducted ${-1 * value} point(s) by ${callerDiscord}! New total: ${pointsEntry.value}. Reason: '${reason}'`;
    }
  }

  await interaction.reply({
    content,
    ephemeral: false,
  });

}

/**
 * Checks a user's ranking or check the leaderboard.
 * @param interaction The interaction object created by the command.
 * @param userDiscord The user to check on The List.
 */
 async function onCheck(interaction: CommandInteraction, userDiscord?: DiscordUser) {

  // There are two different calls here:  If a user is specified, simply check their score.
  // If a user is not specified, you need toprovide an upload of the leaderboard.

  if (userDiscord) {

    // First, you must check to see if the user you are adding exists in the database.
    // If they don't exist, you must add them to the database.
    const user: User = await User.FindOrCreate(userDiscord.id);
    const userId: number = user.getDataValue('id');

    // Second you must check to see if this user has a points entry in the database.
    // If they don't, you must create one.
    const pointsEntry: PointsEntry = await PointsEntry.FindOrCreate(userId);

    // Third, you need to output the user's point value.
    await interaction.reply({
      content: `${userDiscord} has ${pointsEntry.value} points.`,
      ephemeral: false,
    })

  } else {

    // We must create a string containing all points entries matched to their values.
    let paste = '';

    // First, create a map mapping from user ID to current Discord name, to efficiently list users who are on The List multiple times.
    const idToName: Map<number, string> = new Map();
    const users: User[] = await User .findAll();

    for (const user of users) {
      await interaction.client.users.fetch(user.getDataValue('discordId') as Snowflake).then((retrievedUser) => {
        idToName.set(user.getDataValue('id'), `@${retrievedUser.username}#${retrievedUser.discriminator}`);
      });
    } 

    // Second, retrieve all points entries and then sort them by value.
    const pointsEntries: PointsEntry[] = await PointsEntry.findAll();
    pointsEntries.sort((a, b) => (a.value < b.value) ? 1 : -1);

    // Third, construct the leaderboard.
    pointsEntries.forEach((pointsEntry: PointsEntry, index: number) => {
      const entryName: string = idToName.get(pointsEntry.getDataValue('entry')) as string;
      const value: number = pointsEntry.getDataValue('value');

      paste += `${index + 1}.\t${entryName} with ${value} points.\n`;
    })

    fs.writeFileSync('./points.txt', paste);
    await interaction.reply({files: [new MessageAttachment('./points.txt')]});

  }

 }

async function execute(interaction: CommandInteraction): Promise<void> {
  logger.info(`Executing Points command.}`);

  const callerDiscord: DiscordUser = interaction.user;
  let value: CommandInteractionOption;
  let userDiscord: DiscordUser;
  let pointsValue: number;
  let reason: string;
  switch (interaction.options.getSubcommand()) {
    case PointsCommand.ADD:
      value = interaction.options.get(PointsCommand.ADD) as CommandInteractionOption;
      logger.info(`Points ${PointsCommand.ADD} command called with value: ${JSON.stringify(value)}`);

      userDiscord = interaction.options.getUser(PointsCommand.USER) as DiscordUser;
      pointsValue = interaction.options.getInteger(PointsCommand.VALUE) as number;
      reason = interaction.options.getString(PointsCommand.REASON) as string;

      if (pointsValue <= 0 || pointsValue > 9000) {
        await interaction.reply({
          content: `Points value must be positive and below 9000.`,
          ephemeral: true,
        });
      } else {
        await onAdjust(interaction, userDiscord, callerDiscord, pointsValue, reason);
      }

      break;
    case PointsCommand.REMOVE:
      value = interaction.options.get(PointsCommand.REMOVE) as CommandInteractionOption;
      logger.info(`Points ${PointsCommand.REMOVE} command called with value: ${JSON.stringify(value)}`);

      userDiscord = interaction.options.getUser(PointsCommand.USER) as DiscordUser;
      pointsValue = interaction.options.getInteger(PointsCommand.VALUE) as number;
      reason = interaction.options.getString(PointsCommand.REASON) as string;

      if (pointsValue <= 0 || pointsValue > 9000) {
        await interaction.reply({
          content: `Points value must be positive and below 9000.`,
          ephemeral: true,
        });
      } else {
        await onAdjust(interaction, userDiscord, callerDiscord, -1 * pointsValue, reason);
      }

      break;
    case PointsCommand.CHECK:
      value = interaction.options.get(PointsCommand.CHECK) as CommandInteractionOption;
      logger.info(`Points ${PointsCommand.CHECK} command called with value: ${JSON.stringify(value)}`);

      userDiscord = interaction.options.getUser(PointsCommand.USER) as DiscordUser;

      if (userDiscord !== undefined) {
        await onCheck(interaction, userDiscord);
      } else {
        await onCheck(interaction);
      }

      break;
    case PointsCommand.HELP:
      value = interaction.options.get(PointsCommand.HELP) as CommandInteractionOption;
      logger.info(`Points ${PointsCommand.HELP} command called with value: ${JSON.stringify(value)}`);
      await interaction.reply({
        content: `ya`,
        ephemeral: true,
      });
      break;
    default:
      logger.error(`Unrecognized Points Command: ${interaction.commandName}.`);
      await interaction.reply({
        content: `Unknown command.`,
        ephemeral: true,
      });
  }
}

/**
 * The commands associated with the points command.
 */
enum PointsCommand {
  POINTS = 'points',
  ADD = 'add',
  REMOVE = 'remove',
  CHECK = 'check',
  HELP = 'help',
  USER = 'user',
  REASON = 'reason',
  VALUE = 'value',
}

const pointsCommand = new SlashCommandBuilder()
  .setName(PointsCommand.POINTS)
  .setDescription(`'Liam's Server' ranking system.`)
  .addSubcommand(subcommand => 
    subcommand
      .setName(PointsCommand.ADD)
      .setDescription('Award points to a user.')
      .addUserOption(option => 
        option
          .setName(PointsCommand.USER)
          .setDescription('The user to award points to.')
          .setRequired(true)
        )
      .addIntegerOption(option =>
        option
          .setName(PointsCommand.VALUE)
          .setDescription('The amount of points to award.')
          .setRequired(true)
        )
      .addStringOption(option => option
          .setName(PointsCommand.REASON)
          .setDescription('The reason these points were awarded.')
          .setRequired(false)
        )
    )
  .addSubcommand(subcommand => 
    subcommand
    .setName(PointsCommand.REMOVE)
    .setDescription('Deduct points from a user.')
    .addUserOption(option => 
      option
        .setName(PointsCommand.USER)
        .setDescription('The user to deduce points from.')
        .setRequired(true)
      )
    .addIntegerOption(option =>
      option
        .setName(PointsCommand.VALUE)
        .setDescription('The amount of points to deduct.')
        .setRequired(true)
      )
    .addStringOption(option => option
        .setName(PointsCommand.REASON)
        .setDescription('The reason these points were deducted.')
        .setRequired(false)
      )
    )
  .addSubcommand(subcommand => 
    subcommand
      .setName(PointsCommand.CHECK)
      .setDescription('Check the rankings.  If a user is not specified, returns an ordered upload of the rankings.')
      .addUserOption(option => 
        option
          .setName(PointsCommand.USER)
          .setDescription("Check a specific user's ranking.")
          .setRequired(false)
        )
    )
  .addSubcommand(subcommand =>
    subcommand
      .setName(PointsCommand.HELP)
      .setDescription(`Explain 'Liam's Server' ranking system.`)
    )

/**
 * The Points command for the server.  Allows access to and control of the ranking system.
 */
 export const Points: BotCommand = {
  commandData: pointsCommand,
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