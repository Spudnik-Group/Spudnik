import chalk from 'chalk';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { RequestResponse } from 'request';
import * as rp from 'request-promise';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Post a random cat fact.
 *
 * @export
 * @class CatFactCommand
 * @extends {Command}
 */
export default class CatFactCommand extends Command {
	/**
	 * Creates an instance of CatFactCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof CatFactCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Returns a random cat fact.',
			examples: ['!cat-fact'],
			group: 'random',
			memberName: 'cat-fact',
			name: 'cat-fact',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "cat-fact" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof CatFactCommand
	 */
	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		const response = await sendSimpleEmbeddedMessage(msg, 'Loading...');
		rp('https://catfact.ninja/fact')
			.then((content) => {
				const data = JSON.parse(content);

				return msg.embed(new MessageEmbed({
					color: getEmbedColor(msg),
					description: data.fact,
					title: ':cat: Fact'
				}));
			})
			.catch((err: Error) => {
				msg.client.emit('warn', `Error in command random:cat-fact: ${err}`);

				return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
			});
		return response;
	}
}
