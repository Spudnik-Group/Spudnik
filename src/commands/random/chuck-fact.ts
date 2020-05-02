/**
 * Copyright (c) 2020 Spudnik Group
 */

import axios from 'axios';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import * as unescape from 'unescape';

/**
 * Post a random chuck norris fact.
 *
 * @export
 * @class ChuckFactCommand
 * @extends {Command}
 */
export default class ChuckFactCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['chucknorris', 'norrisfact', 'chuck-norris'],
			description: 'Returns a random Chuck Norris fact.',
			name: 'chuck-fact'
		});
	}

	/**
	 * Run the "chuck-fact" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof ChuckFactCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		try {
			const { data } = await axios.get('http://api.icndb.com/jokes/random');

			// Send the success response
			return msg.sendSimpleEmbedWithTitle(unescape(data.value.joke), 'Chuck Norris Fact');
		} catch (err) {
			msg.client.emit('warn', `Error in command facts:chuck-fact: ${err}`);

			return msg.sendSimpleError('There was an error with the request. Try again?', 3000);
		}
	}

}
