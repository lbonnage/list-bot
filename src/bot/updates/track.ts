import { Client, TextChannel } from 'discord.js';
import { BotUpdate } from './bot-update.js';
import { AnimeDetails, JikanService } from '../services/jikan.js';
import { Track as TrackModel } from '../database/models/track.model.js';
import { Logger } from '../../lib/logger.js';

const logger = Logger('track-update');

const jikan = new JikanService();

async function execute(client: Client): Promise<void> {

  logger.info("Updated tracked shows.");

  const channel = client.channels.cache.get(process.env.WEEB_CHANNEL_ID as string) as TextChannel;

  const trackedShows = await TrackModel.findAll();

  // Check to see if any of the tracked shows have new episodes.
  for (let show of trackedShows) {
    const animeDetails: AnimeDetails = await jikan.getAnime(show.showId);

    if (!show.airing) {
      continue;
    }

    if (show.latestEpisode < animeDetails.episodes) {
      show.latestEpisode = animeDetails.episodes;
      await show.save();
      await channel.send(`Episode \`${animeDetails.episodes}\` of ${animeDetails.name} has been released!`);
    }

  }

}

/**
 * The Track update for the bot.
 */
export const Track: BotUpdate = {
  execute,
  interval: 5 * 1000 * 60, // Check for new episodes every 5 minutes.
}