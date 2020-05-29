/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, KlasaMessage } from 'klasa';
import { eightBall } from '../../extras/data';
import { baseEmbed } from '@lib/helpers/embed-helpers.js';
import { getRandomInt } from '@lib/utils/util';

/**
 * Post a random "Magic 8-ball" response to a question.
 *
 * @export
 * @class EightBallCommand
 * @extends {Command}
 */
export default class EightBallCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['8ball'],
			description: 'Ask the magic 8 ball a question.',
			usage: '<query:...string>'
		});
	}

	/**
	 * Run the "8ball" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof EightBallCommand
	 */
	public run(msg: KlasaMessage, [query]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		let response = 'Error getting answer. Try again later?';
		if (eightBall && eightBall.length > 0) {
			response = eightBall[getRandomInt(0, eightBall.length) - 1];

			return msg.sendEmbed(baseEmbed(msg)
				.setDescription(`:8ball: **${response}**`)
				.setTitle(query), '', { reply: msg.author });
		}
		return msg.sendSimpleError(response, 3000);

	}

}
