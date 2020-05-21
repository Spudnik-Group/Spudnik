/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed } from 'discord.js';
import axios from 'axios';
import { Command, CommandStore, KlasaMessage, ReactionHandler, RichMenu } from 'klasa';
import { SpudConfig } from '@lib/config';
import { baseEmbed } from '@lib/helpers/embed-helpers';
import { shorten } from '@lib/utils/util';

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
			usage: '<query:...string>'
		});

		this.customizeResponse('query', 'Please supply the name of a beer or brewery to look up.');
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
			const { data: response } = await axios(`http://api.brewerydb.com/v2/search?q=${encodeURIComponent(query)}&key=${breweryDbApiKey}&withBreweries=Y&withLocations=Y`);

			if (response.data) {
				let result;

				if (response.data.length > 1) {
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
						menu.addOption(`${item.name} (${item.type})`, item.description ? shorten(item.description, 50) : 'No description available.');
					});

					const collector: ReactionHandler = await menu.run(await msg.send('Taking a look in the beer fridge...'));

					// wait for selection
					const choice: number = await collector.selection;
					if (choice === null || choice === undefined) {
						await collector.message.delete();
						return;
					}

					result = response.data[choice];
				} else {
					result = response.data.shift();
				}

				// display selection details
				this.buildEmbed(brewEmbed, result);
			} else {
				brewEmbed.setDescription("Damn, I've never heard of that. Where do I need to go to find it?");
			}

			// Send the success response
			return msg.sendEmbed(brewEmbed);
		} catch (err) {
			msg.client.emit('warn', `Error in command ref:brew: ${err}`);

			return msg.sendSimpleError('There was an error with the request. Try again?', 3000);
		}

	}

	private buildEmbed(embed: MessageEmbed, result: any): void {
		if (result.type === 'beer') {
			embed
				.addField(
					'Brewery',
					result.breweries ? (result.breweries.length ? result.breweries[0].name : 'N/A') : 'N/A'
				)
				.addField(
					'Style',
					result.style ? result.style.name : 'A beer.'
				)
				.addField(
					'Serving Temperature',
					result.servingTemperatureDisplay ? result.servingTemperatureDisplay : 'Cold, of course.'
				)
				.addField(
					'ABV (Alcohol By Volume)',
					`${result.abv}%`,
					true
				)
				.addField(
					'IBU (International Bitterness Units)',
					result.ibu ? `${result.ibu}/100` : 'N/A',
					true
				)
				.addField(
					'Glass',
					result.glass ? result.glass.name : 'A glass.',
					true
				)
				.addField(
					'Availability',
					result.available ? result.available.name : 'Unsure.',
					true
				)
				.addField(
					'Retired',
					result.isRetired,
					true
				)
				.thumbnail = {
					url: result.labels ? result.labels.medium : null
				};
		} else {
			embed
				.addField(
					'Location',
					`${result.locations[0].locality}, ${result.locations[0].region}`
				)
				.addField(
					'Website',
					result.website ? result.website : 'N/A'
				)
				.addField(
					'In Business',
					result.isInBusiness,
					true
				)
				.addField(
					'Mass Owned',
					result.isMassOwned,
					true
				)
				.addField(
					'Year Established',
					result.established,
					true
				)
				.thumbnail = {
					url: result.images.squareMedium
				};
		}

		embed
			.addField(
				'Organic',
				result.isOrganic,
				true
			)
			.setTitle(result.name)
			.setDescription(`\n${result.description ? shorten(result.description) : 'No description available.'}\n\n`);
	}

}
