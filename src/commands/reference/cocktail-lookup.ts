/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed } from 'discord.js';
import axios from 'axios';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { baseEmbed } from '@lib/helpers/embed-helpers';

/**
 * Post information about a cocktail.
 *
 * @export
 * @class CocktailCommand
 * @extends {Command}
 */
export default class CocktailCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Returns information about the supplied cocktail name. If no query is supplied, returns a random drink.',
			name: 'cocktail',
			usage: '[query:...string]'
		});
	}

	/**
	 * Run the "cocktail" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof CocktailCommand
	 */
	public async run(msg: KlasaMessage, [query]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		const cocktailEmbed: MessageEmbed = baseEmbed(msg)
			.setAuthor(
				'CocktailDB',
				'https://emojipedia-us.s3.amazonaws.com/thumbs/240/twitter/103/cocktail-glass_1f378.png',
				'http://www.thecocktaildb.com/'
			);
		const queryURL: string = query ? `http://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}` : 'https://www.thecocktaildb.com/api/json/v1/1/random.php';

		try {
			const { data: response } = await axios(queryURL);

			if (typeof response !== 'undefined' && response.drinks !== null) {
				const result = response.drinks[0];
				const ingredients = this.findSimilarProps(result, 'strIngredient');
				const ratios = this.findSimilarProps(result, 'strMeasure');

				if (result.strInstructions) {
					if (result.strGlass) {
						cocktailEmbed.addField(
							'Glass:',
							result.strGlass,
							true
						);
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
						cocktailEmbed.addField(
							'Ingredients:',
							ingredientsList,
							true
						);
					}

					cocktailEmbed.addField(
						'Instructions:',
						result.strInstructions
					);

					cocktailEmbed.setTitle(`__${result.strDrink}__`);
					cocktailEmbed.setThumbnail(result.strDrinkThumb ? `${result.strDrinkThumb}/preview` : 'https://emojipedia-us.s3.amazonaws.com/thumbs/240/twitter/103/tropical-drink_1f379.png');
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

			return msg.sendSimpleError('There was an error with the request. Try again?', 3000);
		}
	}

	private findSimilarProps(obj: any, propName: string): string[] {
		return Object.keys(obj).filter((k: string) => k.startsWith(propName)).map((key: string) => obj[key]);
	}

}
