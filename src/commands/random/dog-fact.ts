/**
 * Copyright (c) 2020 Spudnik Group
 */

import axios from 'axios';
import { Command, CommandStore, KlasaMessage } from 'klasa';

/**
 * Post a random dog fact.
 *
 * @export
 * @class DogFactCommand
 * @extends {Command}
 */
export default class DogFactCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['dogfact'],
			description: 'Returns a random dog fact.'
		});
	}

	/**
	 * Run the "dog-fact" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof DogFactCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		try {
			const { data } = await axios.get('https://dog-api.kinduff.com/api/facts');

			// Send the success response
			return msg.sendSimpleEmbedWithTitle(data.facts[0], ':dog: Fact');
		} catch (err) {
			msg.client.emit('warn', `Error in command facts:dog-fact: ${err}`);

			return msg.sendSimpleError('There was an error with the request. Try again?', 3000);
		}
	}

}
