/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed } from 'discord.js';
import axios from 'axios';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { SpudConfig } from '@lib/config';
import { baseEmbed } from '@lib/helpers/embed-helpers';

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
	public async run(msg: KlasaMessage, [query]): Promise<KlasaMessage | KlasaMessage[]> {
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
				const result = response.data[0];

				if (result.description) {
					let thumbnail = '';

					if (result.labels) {
						thumbnail = result.labels.medium;
					}

					if (result.images) {
						thumbnail = result.images.squareMedium;
					}

					if (result.name) {
						brewEmbed.setTitle(result.name);
					}

					if (result.style) {
						brewEmbed.addField(
							`Style: ${result.style.name}`,
							result.style.description
						);
					}

					if (result.abv) {
						brewEmbed.addField(
							'ABV (Alcohol By Volume)',
							`${result.abv}%`,
							true
						);
					}

					if (result.ibu) {
						brewEmbed.addField(
							'IBU (International Bitterness Units)',
							`${result.ibu}/100`,
							true
						);
					}

					if (result.website) {
						brewEmbed.addField(
							'Website',
							result.website,
							true
						);
					}

					if (result.established) {
						brewEmbed.addField(
							'Year Established',
							result.established,
							true
						);
					}

					if (thumbnail !== '') {
						brewEmbed.thumbnail = {
							url: thumbnail
						};
					}

					brewEmbed.setDescription(`\n${result.description}\n\n`);
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
