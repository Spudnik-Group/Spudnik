import { oneLine } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { RequestResponse } from 'request';
import * as request from 'request';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Post information about a cocktail.
 *
 * @export
 * @class CocktailCommand
 * @extends {Command}
 */
export default class CocktailCommand extends Command {
	/**
	 * Creates an instance of CocktailCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof CocktailCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'query',
					prompt: 'What cocktail should I look up?\n',
					type: 'string'
				}
			],
			description: 'Returns information about a cocktail. Uses the CocktailDB API.',
			details: oneLine`
				syntax: \`!cocktail <cocktail name>\`
			`,
			examples: [
				'!cocktail bloody mary',
				'!cocktail dark and stormy'
			],
			group: 'ref',
			guildOnly: true,
			memberName: 'cocktail',
			name: 'cocktail',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "cocktail" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof CocktailCommand
	 */
	public async run(msg: CommandMessage, args: { query: string }): Promise<Message | Message[]> {
		const response = await sendSimpleEmbeddedMessage(msg, 'Loading...');
		const cocktailEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/240/twitter/103/cocktail-glass_1f378.png',
				name: 'CocktailDB',
				url: 'http://www.thecocktaildb.com/'
			},
			color: getEmbedColor(msg),
			description: ''
		});

		request(`http://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(args.query)}`, (err: Error, res: RequestResponse, body: any) => {
			if (err !== undefined && err !== null) {
				msg.client.emit('warn', `Error in command ref:cocktail: ${err}`);
				return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
			}
			const response = JSON.parse(body);
			if (typeof response !== 'undefined' && response.drinks !== null) {
				const result = response.drinks[0];
				const ingredients = Object.entries(result).slice(9, 24).map((entry) => entry[1]);
				const ratios = Object.entries(result).slice(24, 39).map((entry) => entry[1]);

				if (typeof result.strInstructions !== 'undefined' && result.strInstructions !== '' && result.strInstructions !== null) {
					const fields = [];
					let thumbnail = '';
					if (typeof result.strDrinkThumb !== 'undefined' && result.strDrinkThumb !== '' && result.strDrinkThumb !== null) {
						thumbnail = result.strDrinkThumb;
					} else {
						thumbnail = 'https://emojipedia-us.s3.amazonaws.com/thumbs/240/twitter/103/tropical-drink_1f379.png';
					}
					if (typeof result.strGlass !== 'undefined' && result.strGlass !== '' && result.strGlass !== null) {
						fields.push({
							inline: true,
							name: 'Glass:',
							value: result.strGlass
						});
					}
					if (typeof ingredients !== 'undefined' && ingredients.length > 0) {
						let ingredientsList = '';
						ingredients.forEach((value: any, index: number) => {
							if (value !== '' && value !== '\n' && value !== null) {
								if (ratios[index] !== '' && ratios[index] !== '\n' && ratios[index] !== null) {
									ingredientsList += `* ${value} - ${ratios[index]}\n`;
								} else {
									ingredientsList += `* ${value}\n`;
								}
							}
						});
						fields.push({
							inline: true,
							name: 'Ingredients:',
							value: ingredientsList
						});
					}
					fields.push({
						name: 'Instructions:',
						value: result.strInstructions
					});

					cocktailEmbed.title = `__${result.strDrink}__`;
					cocktailEmbed.thumbnail = { url: thumbnail };
					cocktailEmbed.fields = fields;
					return msg.embed(cocktailEmbed);
				} else {
					cocktailEmbed.description = `${response.data.drinks[0].strDrink} is a good drink, but I don't have a good way to describe it.`;
					return msg.embed(cocktailEmbed);
				}
			} else {
				cocktailEmbed.description = "Damn, I've never heard of that. Where do I need to go to find it?";
				return msg.embed(cocktailEmbed);
			}
		});
		return response;
	}
}
