import { oneLine } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { RequestResponse } from 'request';
import * as request from 'request';
import { Config } from '../../lib/config';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

const breweryDbApiKey: string = Config.getBreweryDbApiKey();

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
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'query',
					prompt: 'What brew or brewery should I look up?\n',
					type: 'string'
				}
			],
			description: 'Returns information about a brewery or brew. Uses the BreweryDB API.',
			details: oneLine`
				syntax: \`!brew <brew|brewery name>\`
			`,
			examples: [
				'!brew guinness blonde',
				'!brew death by coconut',
				'!brew Monday Night Brewing'
			],
			group: 'ref',
			guildOnly: true,
			memberName: 'brew',
			name: 'brew',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "brew" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof BrewCommand
	 */
	public async run(msg: CommandMessage, args: { query: string }): Promise<Message | Message[]> {
		const response = await sendSimpleEmbeddedMessage(msg, 'Loading...');
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

		request(`http://api.brewerydb.com/v2/search?q=${encodeURIComponent(args.query)}&key=${breweryDbApiKey}`, (err: Error, res: RequestResponse, body: string) => {
			if (err !== undefined && err !== null) {
				msg.client.emit('warn', `Error in command ref:brew: ${err}`);
				return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
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
					if (typeof result.name !== 'undefined') {
						brewEmbed.title = result.name;
					}
					if (typeof result.style !== 'undefined') {
						fields.push({
							name: `Style: ${result.style.name}`,
							value: result.style.description
						});
					}
					if (typeof result.abv !== 'undefined') {
						fields.push({
							inline: true,
							name: 'ABV (Alcohol By Volume)',
							value: `${result.abv}%`
						});
					}
					if (typeof result.ibu !== 'undefined') {
						fields.push({
							inline: true,
							name: 'IBU (International Bitterness Units)',
							value: `${result.ibu}/100`
						});
					}

					if (typeof result.website !== 'undefined') {
						fields.push({
							inline: true,
							name: 'Website',
							value: result.website
						});
					}

					if (typeof result.established !== 'undefined') {
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
		return response;
	}
}
