import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import axios from 'axios';
import { getEmbedColor, deleteCommandMessages } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, stopTyping, startTyping } from '../../lib/helpers';

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
			group: 'facts',
			guildOnly: true,
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
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof ChuckFactCommand
	 */
	public async run(msg: CommandoMessage): Promise<Message | Message[]> {
		const responseEmbed: MessageEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			description: '',
			title: 'Chuck Norris Fact'
		});

		startTyping(msg);

		try {
			const { data } = await axios.get('http://api.icndb.com/jokes/random');
			responseEmbed.setDescription(data.value.joke);
	
			deleteCommandMessages(msg);
			stopTyping(msg);
	
			// Send the success response
			return msg.embed(responseEmbed);
		} catch (err) {
			msg.client.emit('warn', `Error in command facts:chuck-fact: ${err}`);
			
			deleteCommandMessages(msg);
			stopTyping(msg);

			return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
		}
	}
}
