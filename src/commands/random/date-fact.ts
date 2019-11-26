import { MessageEmbed } from 'discord.js';
import axios from 'axios';
import { getEmbedColor, sendSimpleEmbeddedError } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

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
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Returns a random date fact.',
			name: 'date-fact'
		});
	}

	/**
	 * Run the "date-fact" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof DateFactCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const responseEmbed: MessageEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			description: '',
			title: 'Date Fact'
		});

		try {
			const { data } = await axios.get('http://numbersapi.com/random/date?json');
			responseEmbed.setDescription(data.text);

			// Send the success response
			return msg.sendEmbed(responseEmbed);
		} catch (err) {
			msg.client.emit('warn', `Error in command facts:date-fact: ${err}`);

			return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
		}
	}
}
