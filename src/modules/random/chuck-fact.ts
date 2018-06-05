import chalk from 'chalk';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { RequestResponse } from 'request';
import * as rp from 'request-promise';
import { getEmbedColor } from '../../lib/custom-helpers';
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
			description: 'Returns a random Chuck Norris fact.',
			examples: ['!chuck-fact'],
			group: 'random',
			memberName: 'chuck-fact',
			name: 'chuck-fact',
			throttling: {
				duration: 3,
				usages: 2
			}
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
		const response = await sendSimpleEmbeddedMessage(msg, 'Loading...');
		rp('http://api.icndb.com/jokes/random')
			.then((content) => {
				const data = JSON.parse(content);

				return msg.embed(new MessageEmbed({
					color: getEmbedColor(msg),
					description: data.value.joke,
					title: 'Chuck Norris Fact'
				}));
			})
			.catch((err: Error) => {
				msg.client.emit('warn', `Error in command random:chuck-fact: ${err}`);

				return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
			});
		return response;
	}
}
