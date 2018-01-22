import { Message, RichEmbed } from 'discord.js';
import { Spudnik } from '../spudnik';

// tslint:disable-next-line
const Wiki = require('wikijs').default;

module.exports = (Spudnik: Spudnik) => {
	return {
		commands: [
			'wiki',
		],
		// tslint:disable:object-literal-sort-keys
		wiki: {
			usage: '<search terms>',
			description: 'Returns the summary of the first matching search result from Wikipedia',
			process: (msg: Message, suffix: string) => {
				const query = suffix;
				if (!query) {
					return Spudnik.processMessage(`Usage: ${Spudnik.Config.getCommandPrefix()}wiki search terms`, msg, false, false);
				}

				new Wiki().search(query, 1).then((data: any) => {
					new Wiki().page(data.results[0]).then((page: any) => {
						page.summary().then((summary: any) => {
							const sumText = summary.toString().split('\n');
							const continuation = () => {
								const paragraph = sumText.shift();
								if (paragraph) {
									Spudnik.processMessage(new RichEmbed({
										color: Spudnik.Config.getDefaultEmbedColor(),
										title: page.title,
										description: `${paragraph}\n\n${page.fullurl}`,
									}), msg, false, false);
								}
							};
							continuation();
						});
					});
				}, (err: Error) => {
					Spudnik.processMessage(err, msg, false, false);
				});
			},
		},
	};
};
