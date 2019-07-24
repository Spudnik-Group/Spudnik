import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import axios from 'axios';
import { getEmbedColor, deleteCommandMessages } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, startTyping, stopTyping } from '../../lib/helpers';

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
			group: 'facts',
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
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof YearFactCommand
	 */
	public async run(msg: CommandoMessage): Promise<Message | Message[]> {
		const responseEmbed: MessageEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			description: '',
			title: 'Year Fact'
		});

		startTyping(msg);

		try {
			const data: any = await axios.get('http://numbersapi.com/random/year?json');
			responseEmbed.setDescription(data.text);
	
			deleteCommandMessages(msg);
			stopTyping(msg);
	
			// Send the success response
			return msg.embed(responseEmbed);
		} catch (err) {
			msg.client.emit('warn', `Error in command random:year-fact: ${err}`);
			stopTyping(msg);
			
			return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
		}
	}
}
