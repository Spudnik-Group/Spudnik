import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import * as rp from 'request-promise';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage, stopTyping, startTyping, deleteCommandMessages } from '../../lib/helpers';

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
			guildOnly: true,
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
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof DogFactCommand
	 */
	public async run(msg: CommandoMessage): Promise<Message | Message[]> {
		const responseEmbed: MessageEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			description: '',
			title: ':dog: Fact'
		});

		startTyping(msg);

		return rp('https://dog-api.kinduff.com/api/facts')
			.then((content) => {
				const data = JSON.parse(content);
				responseEmbed.setDescription(data.facts[0]);
		
				deleteCommandMessages(msg, this.client);
				stopTyping(msg);

				// Send the success response
				return msg.embed(responseEmbed);
			})
			.catch((err: Error) => {
				msg.client.emit('warn', `Error in command random:dog-fact: ${err}`);
				stopTyping(msg);
				return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
			});
	}
}
