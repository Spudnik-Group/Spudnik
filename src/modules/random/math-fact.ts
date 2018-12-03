import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import * as rp from 'request-promise';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Post a random math fact.
 *
 * @export
 * @class MathFactCommand
 * @extends {Command}
 */
export default class MathFactCommand extends Command {
	/**
	 * Creates an instance of MathFactCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof MathFactCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Returns a random math fact.',
			examples: ['!math-fact'],
			group: 'random',
			guildOnly: true,
			memberName: 'math-fact',
			name: 'math-fact',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "math-fact" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof MathFactCommand
	 */
	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		const response = await sendSimpleEmbeddedMessage(msg, 'Loading...');
		rp('http://numbersapi.com/random/math?json')
			.then((content) => {
				const data = JSON.parse(content);
				return msg.embed(new MessageEmbed({
					color: getEmbedColor(msg),
					description: data.text,
					title: 'Math Fact'
				}));
			})
			.catch((err: Error) => {
				msg.client.emit('warn', `Error in command random:math-fact: ${err}`);
				return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
			});
		return response;
	}
}
