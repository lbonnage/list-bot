import { Client, Intents, Message, Interaction, CommandInteraction, ModalSubmitInteraction } from 'discord.js';
import { BotMessage } from './messages/bot-message.js';
import { BotCommand } from './commands/bot-command.js';
import { BotUpdate } from './updates/bot-update.js';
import { Logger } from '../lib/logger.js';

import * as messages from './messages/index.js';
import * as commands from './commands/index.js';
import * as updates from './updates/index.js';

const logger = Logger('bot');

/**
 * The Bot class, containing logic for all commands and state.
 */
export class Bot {
  // The Discord Client this bot uses.
  private readonly client: Client;

  // The bot token assigned to this bot.
  public readonly token: string;

  // The client ID of this bot.
  public readonly clientId: string;

  // The prefix used to identify message commands to this bot.
  private readonly prefix: string;

  /**
   * Construct an instance of the Bot class.
   * @param token Discord Bot Token.
   * @param clientId Discord Bot Client ID.
   * @param prefix Prefix for message commands.
   */
  constructor(token: string, clientId: string, prefix: string) {
    logger.info(`Creating Bot with prefix: ${prefix}`);
    this.token = token;
    this.clientId = clientId;
    this.prefix = prefix;
    const intents = new Intents();
    intents.add(Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES);
    this.client = new Client({ intents });
  }

  /**
   * Attempt to login to the Discord bot using the provided client token.
   * @returns Promise representing the eventual completion or failure of the login.
   */
  public login(): Promise<string> {
    return this.client.login(this.token);
  }

  /**
   * Initialize the Discord bot with its responses to client events.
   */
  public init(): void {
    logger.info('Bot initializing.');
    this.client.once('ready', this.onReady);
    this.client.on('messageCreate', this.onMessage);
    this.client.on('interactionCreate', this.onInteraction);
    this.initUpdates();
    logger.info('Bot initialized.');
  }

  /**
   * Start the update intervals.
   */
  private initUpdates(): void {
    Object.values(updates).forEach((update: BotUpdate) => {
      setInterval(() => update.execute(this.client), update.interval);
    });
  }

  /**
   * Announce when the bot is ready.
   * @private
   */
  private onReady = () => {
    logger.info(`Bot ready.`);
  };

  /**
   * Response to messages.
   * @private
   */
  private onMessage = (message: Message) => {
    logger.info(`Received Message: ${message}`);

    if (!message.content.startsWith(this.prefix) || message.author.bot) return;

    logger.info(`Received Message: ${message}`);

    const args: string[] = message.content.slice(this.prefix.length).trim().split(/ +/);

    if (args.length < 1) {
      return;
    }

    const command: string = args[0][0].toUpperCase() + args[0].slice(1);

    if (command in messages) {
      logger.info(`Matched input command: ${command}`);
      const botMessage: BotMessage = messages[command as keyof typeof messages] as BotMessage;
      botMessage.execute(this);
    } else {
      logger.error(`Failed to match input command: ${command}`);
    }
  };

  /**
   * Response to interactions.
   * @private
   */
  private onInteraction = async (interaction: Interaction): Promise<void> => {
    logger.info(`Received Interaction.`);
    // TODO Find a way to use an enum for these cases
    switch (interaction.type) {
      case 'APPLICATION_COMMAND':
        await this.handleCommandInteraction(interaction as CommandInteraction);
        break;
      case 'MODAL_SUBMIT':
        await this.handleModalSubmitInteraction(interaction as ModalSubmitInteraction);
        break;
      case 'MESSAGE_COMPONENT':
        break;
      case 'PING':
        break;
      default:
        logger.error(`Unknown Interaction Type: ${interaction.type}.`);
    }
  };

  /**
   * Handles Command Interactions.
   * @param commandInteraction The CommandInteraction that needs to be handled.
   * @private
   */
  private async handleCommandInteraction(commandInteraction: CommandInteraction) {
    logger.info(`Handling Command Interaction: ${commandInteraction.commandName}.`);
    const command: string =
      commandInteraction.commandName[0].toUpperCase() + commandInteraction.commandName.slice(1).toLowerCase();
    if (command in commands) {
      logger.info(`Matched input command: ${command}`);
      const botCommand: BotCommand = commands[command as keyof typeof commands] as BotCommand;
      await botCommand.execute(commandInteraction);
    } else {
      logger.error(`Failed to match input command: ${command}`);
    }
  }

  /**
   * Handles Modal Submit Interactions.
   * @param modalSubmitInteraction The ModalSubmitInteraction that needs to be handled.
   */
  private async handleModalSubmitInteraction(modalSubmitInteraction: ModalSubmitInteraction) {
    const command: string = modalSubmitInteraction.customId.split(' ')[0];
    const modal: string = command[0].toUpperCase() + command.slice(1).toLowerCase();
    logger.info(`Received ${modal}`);
    if (modal in commands) {
      logger.info(`Matched submitted modal: ${modal}`);
      const botCommand: BotCommand = commands[modal as keyof typeof commands] as BotCommand;
      if (botCommand.modalExecute) {
        await botCommand.modalExecute(modalSubmitInteraction);
      } else {
        logger.error(`Command doesn't have a modal interaction: ${modal}`);
      }
    } else {
      logger.error(`Failed to match input modal: ${modal}`);
    }
  }
}
