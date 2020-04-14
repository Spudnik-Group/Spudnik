/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import * as UD from 'urban-dictionary';
import { baseEmbed } from '@lib/helpers/embed-helpers';
import { shorten } from '@lib/helpers/base';

/**
 * Post an Urban Dictionary definition.
 *
 * @export
 * @class UrbanCommand
 * @extends {Command}
 */
export default class UrbanCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Returns the Urban Dictionary result of the supplied query. If no query is supplied, returns a random thing.',
			name: 'urban',
			nsfw: true,
			usage: '[query:...string]'
		});
	}

	/**
	 * Run the "urban" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof UrbanCommand
	 */
	public async run(msg: KlasaMessage, [query]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		const responseEmbed: MessageEmbed = baseEmbed(msg);

		try {
			const targetWord = query ? await UD.term(query) : await UD.random();
			const result = query ? targetWord.entries[0] : targetWord;
			responseEmbed.setTitle(`Urban Dictionary: ${query}`);

			if (result) {
				responseEmbed.setTitle(`Urban Dictionary: ${result.word}`);
				responseEmbed.setDescription(stripIndents`
					${shorten(result.definition, 1500)}\n
					${result.example
		? `Example:
					${result.example}`
		: ''}\n
					\n
					${result.permalink}
				`);
			} else {
				responseEmbed.setDescription('No matches found');
			}

			// Send the success response
			return msg.sendEmbed(responseEmbed);
		} catch (err) {
			msg.client.emit('warn', `Error in command ref:urban: ${err}`);

			return msg.sendSimpleError('There was an error with the request. Try again?', 3000);
		}
	}

}
