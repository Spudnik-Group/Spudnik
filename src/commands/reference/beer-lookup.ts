/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed } from 'discord.js';
import axios from 'axios';
import { Command, CommandStore, KlasaMessage } from 'klasa';
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
			name: 'brew',
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
				const result = response.data[0];

				if (result.description) {
					if (result.type === 'beer') {
						brewEmbed
							.addField(
								'Brewery',
								result.breweries.length ? result.breweries[0].name : 'N/A'
							)
							.addField(
								'Style',
								result.style.name
							)
							.addField(
								'Serving Temperature',
								result.servingTemperatureDisplay
							)
							.addField(
								'ABV (Alcohol By Volume)',
								`${result.abv}%`,
								true
							)
							.addField(
								'IBU (International Bitterness Units)',
								`${result.ibu}/100`,
								true
							)
							.addField(
								'Glass',
								result.glass.name,
								true
							)
							.addField(
								'Availability',
								result.available.name,
								true
							)
							.addField(
								'Retired',
								result.isRetired,
								true
							)
							.thumbnail = {
								url: result.labels.medium
							};
					} else {
						brewEmbed
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

					brewEmbed
						.addField(
							'Organic',
							result.isOrganic,
							true
						)
						.setTitle(result.name)
						.setDescription(`\n${shorten(result.description)}\n\n`);
				} else {
					brewEmbed.setDescription(`${response.data[0].name} is a good beer/brewery, but I don't have a good way to describe it.`);
				}
			} else {
				brewEmbed.setDescription("Damn, I've never heard of that. Where do I need to go to find it?");
			}
		} catch (err) {
			msg.client.emit('warn', `Error in command ref:brew: ${err}`);

			return msg.sendSimpleError('There was an error with the request. Try again?', 3000);
		}

		// Send the success response
		return msg.sendEmbed(brewEmbed);
	}

}
