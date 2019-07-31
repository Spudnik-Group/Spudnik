import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import axios from 'axios';
import { getEmbedColor, deleteCommandMessages } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, stopTyping, startTyping } from '../../lib/helpers';

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
			group: 'facts',
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

		try {
			const { data } = await axios.get('http://numbersapi.com/random/math?json');
			responseEmbed.setDescription(data.text);
	
			deleteCommandMessages(msg);
			stopTyping(msg);

			// Send the success response
			return msg.embed(responseEmbed);
		} catch (err) {
			msg.client.emit('warn', `Error in command random:math-fact: ${err}`);
			stopTyping(msg);
			
			return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
		}
	}
}
