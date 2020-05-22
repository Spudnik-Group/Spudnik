/**
 * Copyright (c) 2020 Spudnik Group
 */

import axios from 'axios';
import { Command, CommandStore, KlasaMessage } from 'klasa';

/**
 * Post a random fact about the year.
 *
 * @export
 * @class YearFactCommand
 * @extends {Command}
 */
export default class YearFactCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['yearfact'],
			description: 'Returns a random year fact.'
		});
	}

	/**
	 * Run the "year-fact" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof YearFactCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		try {
			const { data } = await axios.get('http://numbersapi.com/random/year?json');

			// Send the success response
			return msg.sendSimpleEmbedWithTitle(data.text, 'Year Fact');
		} catch (err) {
			msg.client.emit('warn', `Error in command facts:year-fact: ${err}`);

			return msg.sendSimpleError('There was an error with the request. Try again?', 3000);
		}
	}

}
