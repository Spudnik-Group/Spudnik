import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import * as rp from 'request-promise';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Post a random fact about the year.
 *
 * @export
 * @class YearFactCommand
 * @extends {Command}
 */
export default class YearFactCommand extends Command {
	/**
	 * Creates an instance of YearFactCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof YearFactCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Returns a random year fact.',
			examples: ['!year-fact'],
			group: 'random',
			guildOnly: true,
			memberName: 'year-fact',
			name: 'year-fact',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "year-fact" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof YearFactCommand
	 */
	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		const response = await sendSimpleEmbeddedMessage(msg, 'Loading...');
		rp('http://numbersapi.com/random/year?json')
			.then((content) => {
				const data = JSON.parse(content);
				return msg.embed(new MessageEmbed({
					color: getEmbedColor(msg),
					description: data.text,
					title: 'Year Fact'
				}));
			})
			.catch((err: Error) => {
				msg.client.emit('warn', `Error in command random:year-fact: ${err}`);
				return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
			});
		return response;
	}
}
