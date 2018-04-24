import chalk from 'chalk';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import * as request from 'request';
import { RequestResponse } from 'request';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Post a random chuck norris fact.
 *
 * @export
 * @class ChuckFactCommand
 * @extends {Command}
 */
export default class ChuckFactCommand extends Command {
	/**
	 * Creates an instance of ChuckFactCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof ChuckFactCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['chucknorris', 'norrisfact', 'chuck-norris'],
			description: 'Gives a Random Year Fact.',
			group: 'random',
			guildOnly: true,
			memberName: 'chuck-fact',
			name: 'chuck-fact',
			throttling: {
				duration: 3,
				usages: 2,
			},
		});
	}

	/**
	 * Run the "chuck-fact" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof ChuckFactCommand
	 */
	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		request('http://api.icndb.com/jokes/random', (err: Error, res: RequestResponse, body: string) => {
			try {
				if (err) {
					return sendSimpleEmbeddedError(msg, 'Error getting fact. Try again?');
				}

				const data = JSON.parse(body);
				if (data && data.value && data.value.joke) {
					msg.embed(new MessageEmbed({
						color: 5592405,
						title: 'Chuck Norris Fact',
						description: data.value.joke,
					}));
				}
			} catch (err) {
				const msgTxt = 'failed to retrieve Chuck Norris fact. He probably kicked it. :disappointed_relieved:';
				//TODO: add debug logging: msgTxt += `\n${err.stack}`;
				console.log(chalk.red(err));
				sendSimpleEmbeddedError(msg, msgTxt);
			}
		});
		return sendSimpleEmbeddedMessage(msg, 'Loading...');
	}
}
