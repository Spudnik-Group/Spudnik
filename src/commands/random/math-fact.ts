/**
 * Copyright (c) 2020 Spudnik Group
 */

import axios from 'axios';
import { Command, CommandStore, KlasaMessage } from 'klasa';

/**
 * Post a random math fact.
 *
 * @export
 * @class MathFactCommand
 * @extends {Command}
 */
export default class MathFactCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['mathfact'],
			description: 'Returns a random math fact.'
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
		try {
			const { data } = await axios.get('http://numbersapi.com/random/math?json');

			// Send the success response
			return msg.sendSimpleEmbedWithTitle(data.text, 'Math Fact');
		} catch (err) {
			msg.client.emit('warn', `Error in command facts:math-fact: ${err}`);

			return msg.sendSimpleError('There was an error with the request. Try again?', 3000);
		}
	}

}
