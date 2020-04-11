/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed } from 'discord.js';
import axios from 'axios';
import { Command, CommandStore, KlasaMessage, ReactionHandler, RichMenu } from 'klasa';
import { SpudConfig } from '@lib/config';
import { baseEmbed } from '@lib/helpers/embed-helpers';
import { shorten } from '@lib/helpers/base';

const { breweryDbApiKey } = SpudConfig;

/**
 * Post information about an alcoholic brew.
 *
 * @export
 * @class BrewCommand
 * @extends {Command}
 */
export default class BrewCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Returns information about a brewery or brew. Uses the BreweryDB API.',
			name: 'brew',
			usage: '<query:...string>'
		});

		this.customizeResponse('query', 'Please supply a query');
	}

	/**
	 * Run the "brew" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof BrewCommand
	 */
	public async run(msg: KlasaMessage, [query]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		const brewEmbed: MessageEmbed = baseEmbed(msg)
			.setAuthor(
				'BreweryDB',
				'https://emojipedia-us.s3.amazonaws.com/thumbs/120/twitter/103/beer-mug_1f37a.png',
				'http://www.brewerydb.com/'
			)
			.setFooter('powered by BreweryDB', 'http://s3.amazonaws.com/brewerydb/Powered-By-BreweryDB.png');

		try {
			const { data: response } = await axios(`http://api.brewerydb.com/v2/search?q=${encodeURIComponent(query)}&key=${breweryDbApiKey}`);

			if (response.data) {
				// build RichMenu
				const menu: RichMenu = new RichMenu(baseEmbed(msg)
					.setAuthor(
						'BreweryDB',
						'https://emojipedia-us.s3.amazonaws.com/thumbs/120/twitter/103/beer-mug_1f37a.png',
						'http://www.brewerydb.com/'
					)
					.setFooter('powered by BreweryDB', 'http://s3.amazonaws.com/brewerydb/Powered-By-BreweryDB.png')
					.setDescription('Use the arrow reactions to scroll between pages.\nUse number reactions to select an option.'));

				response.data.forEach((item: any) => {
					if (!item.name || !item.description) return;
					menu.addOption(item.name, shorten(item.description, 50));
				});

				const collector: ReactionHandler = await menu.run(await msg.send('Taking a look in the beer fridge...'));

				// wait for selection
				const choice: number = await collector.selection;
				if (!choice) {
					console.log('no choice');
					await collector.message.delete();
					return null;
				}
				console.log('after');

				// display selection details
				this.buildEmbed(brewEmbed, response.data[choice]);
			} else {
				brewEmbed.setDescription("Damn, I've never heard of that. Where do I need to go to find it?");
			}

			// Send the success response
			await msg.sendEmbed(brewEmbed);

			return null;
		} catch (err) {
			msg.client.emit('warn', `Error in command ref:brew: ${err}`);

			return msg.sendSimpleError('There was an error with the request. Try again?', 3000);
		}

	}

	private buildEmbed(embed: MessageEmbed, result: any): void {

		let thumbnail = '';

		if (result.labels) {
			thumbnail = result.labels.medium;
		}

		if (result.images) {
			thumbnail = result.images.squareMedium;
		}

		if (thumbnail !== '') {
			embed.thumbnail = {
				url: thumbnail
			};
		}

		if (result.name) {
			embed.setTitle(result.name);
		}

		if (result.style) {
			embed.addField(
				`Style: ${result.style.name}`,
				result.style.description
			);
		}

		if (result.abv) {
			embed.addField(
				'ABV (Alcohol By Volume)',
				`${result.abv}%`,
				true
			);
		}

		if (result.ibu) {
			embed.addField(
				'IBU (International Bitterness Units)',
				`${result.ibu}/100`,
				true
			);
		}

		if (result.website) {
			embed.addField(
				'Website',
				result.website,
				true
			);
		}

		if (result.established) {
			embed.addField(
				'Year Established',
				result.established,
				true
			);
		}

		embed.setDescription(`\n${result.description}\n\n`);
	}

}
