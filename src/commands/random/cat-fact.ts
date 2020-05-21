/**
 * Copyright (c) 2020 Spudnik Group
 */

import axios from 'axios';
import { Command, CommandStore, KlasaMessage } from 'klasa';

/**
 * Post a random cat fact.
 *
 * @export
 * @class CatFactCommand
 * @extends {Command}
 */
export default class CatFactCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['cat-fact'],
			description: 'Returns a random cat fact.'
		});
	}

	/**
	 * Run the "cat-fact" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof CatFactCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		try {
			const { data } = await axios.get('https://catfact.ninja/fact');

			// Send the success response
			return msg.sendSimpleEmbedWithTitle(data.fact, ':cat: Fact');
		} catch (err) {
			msg.client.emit('warn', `Error in command facts:cat-fact: ${err}`);

			return msg.sendSimpleError('There was an error with the request. Try again?', 3000);
		}
	}

}
