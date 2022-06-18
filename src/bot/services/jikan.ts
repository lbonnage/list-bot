import { rejects } from 'assert';
import Jikan from 'jikan4.js';
import { Logger } from '../../lib/logger.js';

const logger = Logger('jikan');

export type AnimeDetails = {
  name: string,
  airing: boolean,
  episodes: number,
}


export class JikanService {

  private client: Jikan.Client;

  constructor() {
    this.client = new Jikan.Client();
  }

  public async getAnime(id: number): Promise<AnimeDetails> {
    
    // To avoid overloading the Jikan API, wait a few seconds between requests.
    // await new Promise(resolve => setTimeout(resolve, 5 * 1000));

    return new Promise((resolve, reject) => {
      this.client.anime.get(id)
      .then((anime) => { 
        
        let animeDetails: AnimeDetails = {
          name: "N/A",
          airing: false,
          episodes: -1,
        };
        
        if (anime?.title.english) {
          animeDetails.name = anime.title.english;
        }
        if (anime?.airInfo.airing) {
          animeDetails.airing = anime.airInfo.airing;
        }
        if (anime?.episodes) {
          animeDetails.episodes = anime.episodes;
        }

        resolve(animeDetails)
      }).catch((error) => {
        logger.error(`Failed to find anime ${id}: ${error}`);
        reject(error);
      })
    })

  }

  public static createShowURL(showId: number): string {
    return `https://myanimelist.net/anime/${showId}`;
  }

}