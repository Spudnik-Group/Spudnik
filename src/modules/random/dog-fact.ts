import chalk from 'chalk';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { RequestResponse } from 'request';
import * as rp from 'request-promise';
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
			description: 'Returns a random dog fact.',
			examples: ['!dog-fact'],
			group: 'random',
			memberName: 'dog-fact',
			name: 'dog-fact',
			throttling: {
				duration: 3,
				usages: 2
			}
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
		const response = await sendSimpleEmbeddedMessage(msg, 'Loading...');
		rp('https://dog-api.kinduff.com/api/facts')
			.then((content) => {
				const data = JSON.parse(content);

				return msg.embed(new MessageEmbed({
					color: getEmbedColor(msg),
					description: data.facts[0],
					title: ':dog: Fact'
				}));
			})
			.catch((err: Error) => {
				msg.client.emit('warn', `Error in command random:dog-fact: ${err}`);

				return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
			});
		return response;
	}
}
