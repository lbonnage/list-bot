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
        resolve({
          name: anime?.title.english as string,
          airing: anime?.airInfo.airing as boolean,
          episodes: anime?.episodes as unknown as number,
        })
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