import { MessageEmbed } from 'discord.js';
import axios from 'axios';
import { getEmbedColor, sendSimpleEmbeddedError } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

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
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Returns information about a cocktail. Uses the CocktailDB API.',
			name: 'cocktail',
			usage: '<query:...string>'
		});

		this.customizeResponse('query', 'Please supply a query');
	}

	/**
	 * Run the "cocktail" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof CocktailCommand
	 */
	public async run(msg: KlasaMessage, [query]): Promise<KlasaMessage | KlasaMessage[]> {
		const cocktailEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/240/twitter/103/cocktail-glass_1f378.png',
				name: 'CocktailDB',
				url: 'http://www.thecocktaildb.com/'
			},
			color: getEmbedColor(msg),
			description: ''
		});

		try {
			const { data: response } = await axios(`http://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`)

			if (typeof response !== 'undefined' && response.drinks !== null) {
				const result = response.drinks[0];
				const ingredients = this.findSimilarProps(result, 'strIngredient');
				const ratios = this.findSimilarProps(result, 'strMeasure');

				if (result.strInstructions) {
					const fields = [];
					let thumbnail = '';

					if (result.strDrinkThumb) {
						thumbnail = result.strDrinkThumb;
					} else {
						thumbnail = 'https://emojipedia-us.s3.amazonaws.com/thumbs/240/twitter/103/tropical-drink_1f379.png';
					}

					if (result.strGlass) {
						fields.push({
							inline: true,
							name: 'Glass:',
							value: result.strGlass
						});
					}

					if (ingredients) {
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
				} else {
					cocktailEmbed.setDescription(`${response.data.drinks[0].strDrink} is a good drink, but I don't have a good way to describe it.`);
				}
			} else {
				cocktailEmbed.setDescription("Damn, I've never heard of that. Where do I need to go to find it?");
			}

			// Send the success response
			return msg.sendEmbed(cocktailEmbed);
		} catch (err) {
			msg.client.emit('warn', `Error in command ref:cocktail: ${err}`);

			return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
		};
	}

	private findSimilarProps(obj: any, propName: string): any {
		return Object.keys(obj).filter(k => {
			return k.indexOf(propName) === 0;
		}).map(key => {
			return obj[key]
		});
	}
}
