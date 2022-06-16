import { CommandInteraction, MessageActionRow, Modal, ModalSubmitInteraction, Snowflake, TextInputComponent, User as DiscordUser } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { BotCommand } from './bot-command.js';
import { Logger } from '../../lib/logger.js';
import { TextInputStyles } from 'discord.js/typings/enums.js';
import { ApplicationCommandPermissionTypes } from 'discord.js/typings/enums';
import { AnimeDetails, JikanService } from '../services/jikan.js';
import { Track as TrackModel } from '../database/models/track.model.js';

const logger = Logger('track');

const jikan = new JikanService();

/**
 * The commands associated with the track command.
 */
 enum TrackCommand {
  TRACK = 'track',
  ADD = 'add',
  REMOVE = 'remove',
  CHECK = 'check'
}

/**
 * The IDs associated with the modal.
 */
enum TrackModalIds {
  ADD = 'track add',
  REMOVE = 'track remove',
  CHECK = 'track check',
  ANIME = 'anime',
  EPISODE = 'episode',
}

/**
 * Attempts to start tracking a show.
 * @param interaction The interaction object created from the modal.
 */
async function onAdd(
  interaction: ModalSubmitInteraction
) : Promise<void> {
  const showId: number = parseInt(interaction.fields.getTextInputValue(TrackModalIds.ANIME));
  const episodesWatched: number = parseInt(interaction.fields.getTextInputValue(TrackModalIds.EPISODE));

  jikan.getAnime(showId)
    .then((animeDetails: AnimeDetails) => {
      TrackModel.upsert({
        showId: showId,
        name: animeDetails.name,
        episodesWatched: episodesWatched,
        latestEpisode: animeDetails.episodes,
        airing: animeDetails.airing,
      }).then(() => {
        interaction.reply({ content: `Tracking show [${animeDetails.name}](${JikanService.createShowURL(showId)}).  Episodes watched: \`${episodesWatched}\``});
      }).catch((error) => {
        interaction.reply({ content: `Failed to track show [${animeDetails.name}](${JikanService.createShowURL(showId)}): ${error}`});
      })
    })
    .catch((error) => {
      interaction.reply({ content: `Failed to track show: ${error}`});
    })

}

/**
 * Attempts to stop tracking a show.
 * @param interaction The interaction object created from the modal.
 */
 async function onRemove(
  interaction: ModalSubmitInteraction
) : Promise<void> {

  const showId: number = parseInt(interaction.fields.getTextInputValue(TrackModalIds.ANIME));

  let show = await TrackModel.findOne({
    where: {
      showId: showId
    }
  });

  if (show) {
    await show.destroy();
    interaction.reply({ content: `Stopped tracking [${show.name}](${JikanService.createShowURL(showId)}) after watching \`${show.episodesWatched}\` episodes.`});
  } else {
    interaction.reply({ content: `Failed to stop tracking show.  Is the show being tracked?`, ephemeral: true});
  }
  
}

/**
 * Returns the details of a tracked show.
 * @param interaction The interaction object created from the modal.
 */
async function onCheck(
  interaction: ModalSubmitInteraction
): Promise<void> {
  const showId: number = parseInt(interaction.fields.getTextInputValue(TrackModalIds.ANIME));

  let show = await TrackModel.findOne({
    where: {
      showId: showId
    }
  });

  if (show) {
    interaction.reply({ content: `We have watched \`${show.episodesWatched}\` episodes of [${show.name}](${JikanService.createShowURL(showId)}).  Last episode was watched ${show.updatedAt}.`, ephemeral: true});
  } else {
    interaction.reply({ content: `Failed to check show.  Is the show being tracked?`, ephemeral: true});
  }
}

async function execute(interaction: CommandInteraction): Promise<void> {
  logger.info(`Executing Track command.}`);

  let modal: Modal;
  let showId: TextInputComponent;
  let episode: TextInputComponent;
  let firstActionRow: MessageActionRow<TextInputComponent>;
  let secondActionRow: MessageActionRow<TextInputComponent>;

  switch (interaction.options.getSubcommand()) {
    case TrackCommand.ADD:
      
      modal = new Modal()
        .setCustomId(TrackModalIds.ADD)
        .setTitle('Add Show');
      
      showId = new TextInputComponent()
        .setCustomId(TrackModalIds.ANIME)
        .setLabel('MyAnimeList ID (https://myanimelist.net/)')
        .setStyle(TextInputStyles.SHORT);

      episode = new TextInputComponent()
        .setCustomId(TrackModalIds.EPISODE)
        .setLabel('How many episodes have we watched?')
        .setStyle(TextInputStyles.SHORT);

      firstActionRow = new MessageActionRow<TextInputComponent>().addComponents(showId);
      secondActionRow = new MessageActionRow<TextInputComponent>().addComponents(episode);

      modal.addComponents(firstActionRow, secondActionRow);

      await interaction.showModal(modal);

      break;
    case TrackCommand.REMOVE:

      modal = new Modal()
        .setCustomId(TrackModalIds.REMOVE)
        .setTitle('Remove Show');
    
      showId = new TextInputComponent()
        .setCustomId(TrackModalIds.ANIME)
        .setLabel('MyAnimeList ID (https://myanimelist.net/)')
        .setStyle(TextInputStyles.SHORT);

      firstActionRow = new MessageActionRow<TextInputComponent>().addComponents(showId);

      modal.addComponents(firstActionRow);

      await interaction.showModal(modal);

      break;
    case TrackCommand.CHECK:

      modal = new Modal()
        .setCustomId(TrackModalIds.CHECK)
        .setTitle('Check Show');
    
      showId = new TextInputComponent()
        .setCustomId(TrackModalIds.ANIME)
        .setLabel('MyAnimeList ID (https://myanimelist.net/)')
        .setStyle(TextInputStyles.SHORT);

      firstActionRow = new MessageActionRow<TextInputComponent>().addComponents(showId);

      modal.addComponents(firstActionRow);

      await interaction.showModal(modal);

      break;
    default:
      logger.error(`Unrecognized Track Command: ${interaction.commandName}.`);
      await interaction.reply({
        content: `Unknown command.`,
        ephemeral: true,
      });
  }

}

async function modalExecute(interaction: ModalSubmitInteraction):  Promise<void> {
  logger.info(`Handling Track modal.`);

  switch (interaction.customId) {
    case TrackModalIds.ADD:
      logger.info(`${TrackModalIds.ADD} called.`);
      await onAdd(interaction);
      break;
    case TrackModalIds.REMOVE:
      logger.info(`${TrackModalIds.REMOVE} called.`);
      await onRemove(interaction);
      break;
    case TrackModalIds.CHECK:
      logger.info(`${TrackModalIds.CHECK} called.`);
      await onCheck(interaction);
      break;
  }

}

const trackCommand = new SlashCommandBuilder()
  .setName(TrackCommand.TRACK)
  .setDescription('Handle show tracking.')
  .addSubcommand(subcommand =>
    subcommand
      .setName(TrackCommand.ADD)
      .setDescription('Start tracking a show.'))
  .addSubcommand(subcommand =>
    subcommand
      .setName(TrackCommand.REMOVE)
      .setDescription('Stop tracking a show.'))
  .addSubcommand(subcommand =>
    subcommand
      .setName(TrackCommand.CHECK)
      .setDescription('Check the status of a show.'))


/**
 * The Track command for the server. Allows tracking of shows.
 */
export const Track: BotCommand = {
  commandData: trackCommand,
  execute,
  modalExecute,
  permissions: [
    {
      guildId: process.env.LIAMS_SERVER_GUILD_ID as Snowflake,
      permissions: [
        {
          id: process.env.WEEB_ROLE_ID as Snowflake,
          type: ApplicationCommandPermissionTypes.ROLE,
          permission: true,
        },
      ],
    },
  ],
}
