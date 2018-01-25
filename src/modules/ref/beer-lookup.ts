import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage } from 'discord.js-commando';
import { RequestResponse } from 'request';
import * as request from 'request';
import { SpudnikClient } from '../../lib/client';
import { sendSimpleEmbeddedError } from '../../lib/helpers';

export default class BrewCommand extends Command {
	constructor(client: SpudnikClient) {
		super(client, {
			description: 'Used to retrieve specific information about a brewery or brew.',
			group: 'ref',
			guildOnly: true,
			memberName: 'brew',
			name: 'brew',
			throttling: {
				duration: 3,
				usages: 2,
			},
			args: [
				{
					default: '',
					key: 'query',
					prompt: 'what brew or brewery should I look up?\n',
					type: 'string',
				},
			],
		});
	}

	public async run(msg: CommandMessage, args: { query: string }): Promise<Message | Message[]> {
		const brewEmbed: MessageEmbed = new MessageEmbed({
			color: 5592405,
			author: {
				name: 'BreweryDB',
				url: 'http://www.brewerydb.com/',
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/twitter/103/beer-mug_1f37a.png',
			},
			footer: {
				text: 'powered by BreweryDB',
				icon_url: 'http://s3.amazonaws.com/brewerydb/Powered-By-BreweryDB.png',
			},
			description: '',
		});

		request(`http://api.brewerydb.com/v2/search?q=${encodeURIComponent(args.query)}&key=${(msg.client as SpudnikClient).config.getBreweryDbApiKey()}`, (err: Error, res: RequestResponse, body: string) => {
			if (err !== undefined && err !== null) {
				brewEmbed.description = 'Service unavailable!';
			} else if (typeof body !== 'undefined') {
				const response = JSON.parse(body);
				const result = response.data[0];
				if (typeof result.description !== 'undefined') {
					const fields: any = [];
					let thumbnail = '';
					if (typeof result.labels !== 'undefined') {
						thumbnail = result.labels.medium;
					}

					if (typeof result.images !== 'undefined') {
						thumbnail = result.images.squareMedium;
					}

					if (typeof result.style !== 'undefined') {
						fields.push({
							name: `Style: ${result.style.name}`,
							value: result.style.description,
						});
					}
					if (typeof result.abv !== 'undefined') {
						fields.push({
							name: 'ABV (Alcohol By Volume)',
							value: `${result.abv}%`,
							inline: true,
						});
					}
					if (typeof result.ibu !== 'undefined') {
						fields.push({
							name: 'IBU (International Bitterness Units)',
							value: `${result.ibu}/100`,
							inline: true,
						});
					}

					if (typeof result.website !== 'undefined') {
						fields.push({
							name: 'Website',
							value: result.website,
							inline: true,
						});
					}

					if (typeof result.established !== 'undefined') {
						fields.push({
							name: 'Year Established',
							value: result.established,
							inline: true,
						});
					}

					if (fields !== []) {
						brewEmbed.fields = fields;
					}
					if (thumbnail !== '') {
						brewEmbed.thumbnail = {
							url: thumbnail,
						};
					}
					brewEmbed.description = `\n${result.description}\n\n`;
				} else {
					brewEmbed.description = `${response.data[0].name} is a good beer, but I don't have a good way to describe it.`;
				}
			} else {
				brewEmbed.description = "Damn, I've never heard of that. Where do I need to go to find it?";
			}
			return msg.embed(brewEmbed);
		});
		return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?');
	}
}
