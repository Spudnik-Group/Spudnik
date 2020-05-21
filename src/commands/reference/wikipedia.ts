/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed } from 'discord.js';
import * as WikiJS from 'wikijs';
import { Command, CommandStore, KlasaMessage, ReactionHandler, RichMenu } from 'klasa';
import { baseEmbed } from '@lib/helpers/embed-helpers';
import { shorten } from '@lib/utils/util';

/**
 * Post a summary from Wikipedia.
 *
 * @export
 * @class WikiCommand
 * @extends {Command}
 */
export default class WikiCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['wiki'],
			description: 'Returns the Wikipedia result of the supplied query. If no query is supplied, returns a random Wikipedia result.',
			usage: '[query:...string]'
		});
	}

	/**
	 * Run the "wiki" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof WikiCommand
	 */
	public async run(msg: KlasaMessage, [query]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		try {
			const data: any = query ? await WikiJS.default().search(query, 5) : await WikiJS.default().random();
			let result;

			if (data.results) {
				// build RichMenu
				const menu: RichMenu = new RichMenu(baseEmbed(msg)
					.setFooter(`Powered by WikiJS and Wikipedia`, 'https://raw.githubusercontent.com/dijs/wiki/HEAD/img/wikijs.png')
					.setDescription('Use the arrow reactions to scroll between pages.\nUse number reactions to select an option.'));

				data.results.forEach((item: any) => {
					menu.addOption(item, '-');
				});

				const collector: ReactionHandler = await menu.run(await msg.send('Taking a look in the database...'));

				// wait for selection
				const choice: number = await collector.selection;
				if (choice === null || choice === undefined) {
					await collector.message.delete();
					return;
				}

				result = data.results[choice];
			} else {
				result = data.shift();
			}

			const page: any = await WikiJS.default().page(result);
			const embed: MessageEmbed = baseEmbed(msg);

			await this.buildEmbed(embed, page);

			// Send the success response
			return msg.sendEmbed(embed);
		} catch (err) {
			msg.client.emit('warn', `Error in command ref:wiki: ${err}`);

			return msg.sendSimpleError('There was an error with the request. Try again?', 3000);
		}
	}

	private async buildEmbed(embed: MessageEmbed, page: any): Promise<void> {
		const summary: string = await page.summary();
		const sumText = summary.split('\n');
		let paragraph = sumText.shift();

		if (paragraph) {
			// Wikipedia API Limitation:
			// IPA phonetics are not returned in the summary but the parenthesis that they are encapsulated in are...
			paragraph = paragraph.replace(' ()', '').replace('()', '');
			embed
				.setDescription(`${shorten(paragraph)}...`)
				.setThumbnail(await page.mainImage() || 'https://i.imgur.com/fnhlGh5.png')
				.addField('Read More:', page.raw.fullurl)
				.setFooter(`Powered by WikiJS and Wikipedia`, 'https://raw.githubusercontent.com/dijs/wiki/HEAD/img/wikijs.png')
				.setTitle(page.raw.title);
		} else {
			embed.setDescription('No results. Try again?');
		}
	}

}
