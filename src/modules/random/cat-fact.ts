import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import * as rp from 'request-promise';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage, stopTyping, startTyping, deleteCommandMessages } from '../../lib/helpers';

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
			guildOnly: true,
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
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof CatFactCommand
	 */
	public async run(msg: CommandoMessage): Promise<Message | Message[]> {
		const responseEmbed: MessageEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			description: '',
			title: ':cat: Fact'
		});

		startTyping(msg);

		return rp('https://catfact.ninja/fact')
			.then((content) => {
				const data = JSON.parse(content);
				responseEmbed.setDescription(data.fact);

				deleteCommandMessages(msg, this.client);
				stopTyping(msg);

				// Send the success response
				return msg.embed(responseEmbed);
			})
			.catch((err: Error) => {
				msg.client.emit('warn', `Error in command random:cat-fact: ${err}`);
				stopTyping(msg);
				return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
			});
	}
}
