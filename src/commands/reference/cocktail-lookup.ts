/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed } from 'discord.js';
import axios from 'axios';
import { Command, CommandStore, KlasaMessage, ReactionHandler, RichMenu } from 'klasa';
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

			if (response && response.drinks) {
				let result;

				if (response.drinks.length > 1) {
					// build RichMenu
					const menu: RichMenu = new RichMenu(baseEmbed(msg)
						.setAuthor(
							'CocktailDB',
							'https://emojipedia-us.s3.amazonaws.com/thumbs/240/twitter/103/cocktail-glass_1f378.png',
							'http://www.thecocktaildb.com/'
						)
						.setDescription('Use the arrow reactions to scroll between pages.\nUse number reactions to select an option.'));

					response.drinks.forEach((item: any) => {
						menu.addOption(item.strDrink, `Glass: ${item.strGlass}`);
					});

					const collector: ReactionHandler = await menu.run(await msg.send('Taking a look at the bar...'));

					// wait for selection
					const choice: number = await collector.selection;
					if (!choice) {
						await collector.message.delete();
						return;
					}

					result = response.drinks[choice];
				} else {
					result = response.drinks.shift();
				}

				this.buildEmbed(cocktailEmbed, result);
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

	private buildEmbed(embed: MessageEmbed, result: any): void {
		const ingredients = this.findSimilarProps(result, 'strIngredient');
		const ratios = this.findSimilarProps(result, 'strMeasure');

		if (result.strGlass) {
			embed.addField(
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
			embed.addField(
				'Ingredients:',
				ingredientsList,
				true
			);
		}

		embed.addField(
			'Instructions:',
			result.strInstructions
		);

		embed.setTitle(`__${result.strDrink}__`);
		embed.setThumbnail(result.strDrinkThumb ? `${result.strDrinkThumb}/preview` : 'https://emojipedia-us.s3.amazonaws.com/thumbs/240/twitter/103/tropical-drink_1f379.png');
	}

}
