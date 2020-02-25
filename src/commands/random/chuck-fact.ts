/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed } from 'discord.js';
import axios from 'axios';
import { getEmbedColor, sendSimpleEmbeddedError } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';

/**
 * Post a random chuck norris fact.
 *
 * @export
 * @class ChuckFactCommand
 * @extends {Command}
 */
export default class ChuckFactCommand extends Command {

	constructor(store: CommandStore, file: string[], directory: string) {
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
		const responseEmbed: MessageEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			description: '',
			title: 'Chuck Norris Fact'
		});

		try {
			const { data } = await axios.get('http://api.icndb.com/jokes/random');
			responseEmbed.setDescription(data.value.joke);

			// Send the success response
			return msg.sendEmbed(responseEmbed);
		} catch (err) {
			msg.client.emit('warn', `Error in command facts:chuck-fact: ${err}`);

			return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
		}
	}

}
