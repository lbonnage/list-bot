import got from 'got';
import { Logger } from '../../lib/logger.js';

const logger = Logger('pastebin');

export class PastebinService {
  public static async createPaste(paste: string): Promise<string> {
    return new Promise((resolve, reject) => {
      got
        .post('https://pastebin.com/api/api_post.php', {
          form: {
            api_dev_key: 'Vf2Y5zGR09b3-EEuIbF6gtLGPWwU5pN-',
            api_option: 'paste',
            api_paste_code: paste,
            api_paste_name: 'The List',
            api_paste_private: 1,
            api_paste_expire_date: '1D',
          },
        })
        .then((response) => {
          resolve(response.body);
        })
        .catch((error) => {
          logger.error(`Failed to create paste: ${error}`);
          reject(error);
        });
    });
  }
}
