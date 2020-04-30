/**
 * Copyright (c) 2020 Spudnik Group
 */

import { oneLine } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { Command, CommandStore, KlasaMessage, RichMenu, ReactionHandler } from 'klasa';
import { SpudConfig } from '@lib/config';
import * as mw from 'mw-dict';
import { baseEmbed } from '@lib/helpers/embed-helpers';
import { shorten } from '@lib/utils/util';

const { dictionaryApiKey } = SpudConfig;
const dict = new mw.CollegiateDictionary(dictionaryApiKey);

/**
 * Post the definition of a word.
 *
 * @export
 * @class DefineCommand
 * @extends {Command}
 */
export default class DefineCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Returns the definition of a supplied word. Uses the Merriam-Webster Collegiate Dictionary API.',
			name: 'define',
			usage: '<query:...string>'
		});

		this.customizeResponse('query', 'Please supply a word to define.');
	}

	/**
	 * Run the "define" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof DefineCommand
	 */
	public async run(msg: KlasaMessage, [query]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		if (!dictionaryApiKey) return msg.sendSimpleError('No API Key has been set up. This feature is unusable', 3000);
		const word = query;
		const dictionaryEmbed: MessageEmbed = baseEmbed(msg)
			.setFooter(
				'powered by Merriam-Webster\'s Collegiate® Dictionary',
				'http://www.dictionaryapi.com/images/info/branding-guidelines/mw-logo-light-background-50x50.png'
			);

		try {
			const results = await dict.lookup(word);
			let result;

			if (results.length > 1) {
				// build RichMenu
				const menu: RichMenu = new RichMenu(baseEmbed(msg)
					.setFooter(
						'powered by Merriam-Webster\'s Collegiate® Dictionary',
						'http://www.dictionaryapi.com/images/info/branding-guidelines/mw-logo-light-background-50x50.png'
					)
					.setDescription('Use the arrow reactions to scroll between pages.\nUse number reactions to select an option.'));

				results.forEach((item: any) => {
					menu.addOption(item.word, shorten(this.renderDefinition(item.definition), 50));
				});

				const collector: ReactionHandler = await menu.run(await msg.send('Flipping through Webster\'s Collegiate Dictionary...'));

				// wait for selection
				const choice: number = await collector.selection;
				if (choice === null || choice === undefined) {
					await collector.message.delete();
					return;
				}

				result = results[choice];
			} else {
				result = results.shift();
			}

			this.buildEmbed(dictionaryEmbed, result);

			// Send the success response
			return msg.sendEmbed(dictionaryEmbed);
		} catch (err) {
			msg.client.emit('warn', `Error in command ref:define: ${err}`);

			return msg.sendSimpleError('Word not found.', 3000);
		}
	}

	private renderDefinition(sensesIn: any): string {
		return sensesIn
			.map((def: any) => oneLine`
				${def.number ? `*${def.number}.*` : ''}
				${def.meanings && def.meanings.length ? def.meanings.join(' ') : ''}
				${def.synonyms && def.synonyms.length ? def.synonyms.map((s: any) => `_${s}_`).join(', ') : ''}
				${def.illustrations && def.illustrations.length ? def.illustrations.map((i: any) => `* ${i}`).join('\n') : ''}
				${def.senses && def.senses.length ? this.renderDefinition(def.senses) : ''}
			`)
			.join('\n');
	}

	private buildEmbed(embed: MessageEmbed, result: any): void {
		if (result.functional_label) {
			embed.addField('Functional Label:', result.functional_label);
		}

		if (result.pronunciation[0]) {
			embed.addField('Pronunciation:', result.pronunciation[0]);
		}

		if (result.etymology) {
			embed.addField('Etymology:', result.etymology);
		}

		if (result.popularity) {
			embed.addField('Popularity:', result.popularity);
		}

		embed
			.setDescription(shorten(this.renderDefinition(result.definition)))
			.setTitle(`Definition Result: ${result.word}`);
	}

}
