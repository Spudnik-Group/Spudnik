import { MessageEmbed } from 'discord.js';
import axios from 'axios';
import { getEmbedColor, sendSimpleEmbeddedError } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';
import { stripIndents } from 'common-tags';

const breweryDbApiKey: string = process.env.spud_brewdbapi;

/**
 * Post information about an alcoholic brew.
 *
 * @export
 * @class BrewCommand
 * @extends {Command}
 */
export default class BrewCommand extends Command {
	/**
	 * Creates an instance of BrewCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof BrewCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Returns information about a brewery or brew. Uses the BreweryDB API.',
			extendedHelp: stripIndents`
				syntax: \`!brew <brew|brewery name>\`
			`,
			name: 'brew',
			usage: '<query:...string>'
		});
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
		const brewEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/twitter/103/beer-mug_1f37a.png',
				name: 'BreweryDB',
				url: 'http://www.brewerydb.com/'
			},
			color: getEmbedColor(msg),
			description: '',
			footer: {
				icon_url: 'http://s3.amazonaws.com/brewerydb/Powered-By-BreweryDB.png',
				text: 'powered by BreweryDB'
			}
		});

		try {
			const { data: response } = await axios(`http://api.brewerydb.com/v2/search?q=${encodeURIComponent(query)}&key=${breweryDbApiKey}`)

			if (response.data) {
				const result = response.data[0];

				if (result.description) {
					const fields: any = [];
					let thumbnail = '';

					if (result.labels) {
						thumbnail = result.labels.medium;
					}

					if (result.images) {
						thumbnail = result.images.squareMedium;
					}

					if (result.name) {
						brewEmbed.title = result.name;
					}

					if (result.style) {
						fields.push({
							name: `Style: ${result.style.name}`,
							value: result.style.description
						});
					}

					if (result.abv) {
						fields.push({
							inline: true,
							name: 'ABV (Alcohol By Volume)',
							value: `${result.abv}%`
						});
					}

					if (result.ibu) {
						fields.push({
							inline: true,
							name: 'IBU (International Bitterness Units)',
							value: `${result.ibu}/100`
						});
					}

					if (result.website) {
						fields.push({
							inline: true,
							name: 'Website',
							value: result.website
						});
					}

					if (result.established) {
						fields.push({
							inline: true,
							name: 'Year Established',
							value: result.established
						});
					}

					if (fields !== []) {
						brewEmbed.fields = fields;
					}

					if (thumbnail !== '') {
						brewEmbed.thumbnail = {
							url: thumbnail
						}
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

			return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
		}

		// Send the success response
		return msg.sendEmbed(brewEmbed);
	}
}
