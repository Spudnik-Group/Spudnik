import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import * as rp from 'request-promise';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, stopTyping, startTyping, deleteCommandMessages } from '../../lib/helpers';

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
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof MathFactCommand
	 */
	public async run(msg: CommandoMessage): Promise<Message | Message[]> {
		const responseEmbed: MessageEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			description: '',
			title: 'Math Fact'
		});

		startTyping(msg);

		return rp('http://numbersapi.com/random/math?json')
			.then((content) => {
				const data = JSON.parse(content);
				responseEmbed.setDescription(data.text);
		
				deleteCommandMessages(msg, this.client);
				stopTyping(msg);

				// Send the success response
				return msg.embed(responseEmbed);
			})
			.catch((err: Error) => {
				msg.client.emit('warn', `Error in command random:math-fact: ${err}`);
				stopTyping(msg);
				
				return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
			});
	}
}
