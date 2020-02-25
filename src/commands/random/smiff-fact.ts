/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed } from 'discord.js';
import { getRandomInt, getEmbedColor } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';

const { smiff }: { smiff: string[] } = require('../../extras/data.json');

/**
 * Post a random Will Smith fact.
 *
 * @export
 * @class SmiffFactCommand
 * @extends {Command}
 */
export default class SmiffFactCommand extends Command {
	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['smith-fact', 'willsmith'],
			description: 'Returns a random Will Smith fact.',
			name: 'smiff-fact'
		});
	}

	/**
	 * Run the "smiff-fact" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof SmiffFactCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const responseEmbed: MessageEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			description: '',
			title: 'Will Smith Fact'
		});

		responseEmbed.setDescription(smiff[getRandomInt(0, smiff.length) - 1]);

		// Send the success response
		return msg.sendEmbed(responseEmbed);
	}
}
