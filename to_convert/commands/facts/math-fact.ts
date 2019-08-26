import { Message, MessageEmbed } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
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
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
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
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof MathFactCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
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
			msg.client.emit('warn', `Error in command facts:math-fact: ${err}`);
			
			deleteCommandMessages(msg);
			stopTyping(msg);
			
			return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
		}
	}
}
