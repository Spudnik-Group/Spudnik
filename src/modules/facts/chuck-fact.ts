import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import * as rp from 'request-promise';
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

		return rp('http://api.icndb.com/jokes/random')
			.then((content) => {
				const data = JSON.parse(content);
				responseEmbed.setDescription(data.value.joke);
		
				deleteCommandMessages(msg);
				stopTyping(msg);
		
				// Send the success response
				return msg.embed(responseEmbed);
			})
			.catch((err: Error) => {
				msg.client.emit('warn', `Error in command random:chuck-fact: ${err}`);
				stopTyping(msg);
				
				return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
			});
	}
}
