/**
 * Copyright (c) 2020 Spudnik Group
 */

import axios from 'axios';
import { Command, CommandStore, KlasaMessage } from 'klasa';

/**
 * Post a fact about the current date.
 *
 * @export
 * @class DateFactCommand
 * @extends {Command}
 */
export default class DateFactCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['datefact'],
			description: 'Returns a random date fact.'
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
		try {
			const { data } = await axios.get('http://numbersapi.com/random/date?json');

			// Send the success response
			return msg.sendSimpleEmbedWithTitle(data.text, 'Date Fact');
		} catch (err) {
			msg.client.emit('warn', `Error in command facts:date-fact: ${err}`);

			return msg.sendSimpleError('There was an error with the request. Try again?', 3000);
		}
	}

}
