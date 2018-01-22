import { Message, RichEmbed } from 'discord.js';
import { RequestResponse } from 'request';
import * as request from 'request';
import { Spudnik } from '../spudnik';

module.exports = (Spudnik: Spudnik) => {
	return {
		commands: [
			'cocktail',
		],
		// tslint:disable:object-literal-sort-keys
		cocktail: {
			usage: '[cocktail]',
			type: 'normal',
			description: 'Used to retrieve information about a cocktail.',
			process: (msg: Message, suffix: string) => {
				const cocktailEmbed: RichEmbed = new RichEmbed({
					color: Spudnik.Config.getDefaultEmbedColor(),
					author: {
						name: 'CocktailDB',
						url: 'http://www.thecocktaildb.com/',
						icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/240/twitter/103/cocktail-glass_1f378.png',
					},
					description: 'How about asking for something specific?',
				});
				if (!suffix) {
					return Spudnik.processMessage(cocktailEmbed, msg, false, false);
				}

				request(`http://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(suffix)}`, (err: Error, res: RequestResponse, body: any) => {
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
							} else if (thumbnail === '') {
								thumbnail = 'https://emojipedia-us.s3.amazonaws.com/thumbs/240/twitter/103/tropical-drink_1f379.png';
							}
							if (typeof result.strGlass !== 'undefined' && result.strGlass !== '' && result.strGlass !== null) {
								fields.push({
									name: 'Glass:',
									value: result.strGlass,
									inline: true,
								});
							}
							if (typeof ingredients !== 'undefined' && ingredients.length > 0) {
								let ingredientsList = '';
								ingredients.forEach((element: string, index: number) => {
									if (element !== '' && element !== '\n' && element !== null) {
										if (ratios[index] !== '' && ratios[index] !== '\n' && ratios[index] !== null) {
											ingredientsList += `* ${element} - ${ratios[index]}\n`;
										} else {
											ingredientsList += `* ${element}\n`;
										}
									}
								});
								fields.push({
									name: 'Ingredients:',
									value: ingredientsList,
									inline: true,
								});
							}
							fields.push({
								name: 'Instructions:',
								value: result.strInstructions,
							});

							cocktailEmbed.title = `__${result.strDrink}__`;
							cocktailEmbed.thumbnail = { url: thumbnail };
							cocktailEmbed.fields = fields;
							return Spudnik.processMessage(cocktailEmbed, msg, false, false);
						} else {
							cocktailEmbed.description = `${response.data.drinks[0].strDrink} is a good drink, but I don't have a good way to describe it.`;
							return Spudnik.processMessage(cocktailEmbed, msg, false, false);
						}
					} else {
						cocktailEmbed.description = "Damn, I've never heard of that. Where do I need to go to find it?";
						return Spudnik.processMessage(cocktailEmbed, msg, false, false);
					}
				});
			},
		},
	};
};
