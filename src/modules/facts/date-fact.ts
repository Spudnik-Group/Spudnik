import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import axios from 'axios';
import { getEmbedColor, deleteCommandMessages } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, stopTyping, startTyping } from '../../lib/helpers';

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
			group: 'facts',
			guildOnly: true,
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
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof DateFactCommand
	 */
	public async run(msg: CommandoMessage): Promise<Message | Message[]> {
		const responseEmbed: MessageEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			description: '',
			title: 'Date Fact'
		});

		startTyping(msg);

		try {
			const { data } = await axios.get('http://numbersapi.com/random/date?json');
			responseEmbed.setDescription(data.text);
	
			deleteCommandMessages(msg);
			stopTyping(msg);

			// Send the success response
			return msg.embed(responseEmbed);
		} catch (err) {
			msg.client.emit('warn', `Error in command random:date-fact: ${err}`);
			stopTyping(msg);
			
			return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
		}
	}
}
