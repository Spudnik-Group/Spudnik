import chalk from 'chalk';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { RequestResponse } from 'request';
import * as rp from 'request-promise';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Post a fact about the current date.
 *
 * @export
 * @class DateFactCommand
 * @extends {Command}
 */
export default class DateFactCommand extends Command {
	/**
	 * Creates an instance of DateFactCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof DateFactCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Returns a random date fact.',
			examples: ['!date-fact'],
			group: 'random',
			memberName: 'date-fact',
			name: 'date-fact',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "date-fact" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof DateFactCommand
	 */
	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		const response = await sendSimpleEmbeddedMessage(msg, 'Loading...');
		rp('http://numbersapi.com/random/date?json')
			.then((content) => {
				const data = JSON.parse(content);

				return msg.embed(new MessageEmbed({
					color: getEmbedColor(msg),
					description: data.text,
					title: 'Date Fact'
				}));
			})
			.catch((err: Error) => {
				msg.client.emit('warn', `Error in command random:date-fact: ${err}`);

				return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
			});
		return response;
	}
}
