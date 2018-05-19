import chalk from 'chalk';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import * as request from 'request';
import { RequestResponse } from 'request';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Post a random dog fact.
 *
 * @export
 * @class DogFactCommand
 * @extends {Command}
 */
export default class DogFactCommand extends Command {
	/**
	 * Creates an instance of DogFactCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof DogFactCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Gives a Random Dog Fact.',
			group: 'random',
			guildOnly: true,
			memberName: 'dog-fact',
			name: 'dog-fact',
			throttling: {
				duration: 3,
				usages: 2,
			},
		});
	}

	/**
	 * Run the "dog-fact" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof DogFactCommand
	 */
	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		request('https://dog-api.kinduff.com/api/facts', (err: Error, res: RequestResponse, body: string) => {
			try {
				if (err) {
					return sendSimpleEmbeddedError(msg, 'Error getting fact. Try again?');
				}

				const data = JSON.parse(body);
				if (data && data.facts && data.facts[0]) {
					return msg.embed(new MessageEmbed({
						color: getEmbedColor(msg),
						title: ':dog: Fact',
						description: data.facts[0],
					}));
				}
			} catch (err) {
				const msgTxt = 'command dog-fact failed :disappointed_relieved:';
				//TODO: add debug logging: msgTxt += `\n${err.stack}`;
				console.log(chalk.red(err));
				return sendSimpleEmbeddedError(msg, msgTxt);
			}
		});
		return sendSimpleEmbeddedMessage(msg, 'Loading...');
	}
}
