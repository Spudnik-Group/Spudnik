import { Message, RichEmbed } from 'discord.js';
import { Spudnik } from '../spudnik';

// tslint:disable-next-line
const urban = require('urban');

module.exports = (Spudnik: Spudnik) => {
	return {
		commands: [
			'urban',
		],
		// tslint:disable:object-literal-sort-keys
		urban: {
			usage: '<word>',
			description: 'looks up a word on Urban Dictionary',
			process: (msg: Message, suffix: string) => {
				const targetWord = suffix === '' ? urban.random() : urban(suffix);
				targetWord.first((json: any) => {
					let title = `Urban Dictionary: ${suffix}`;
					let message;
					let example;

					if (json) {
						title = `Urban Dictionary: ${json.word}`;
						message = `${json.definition}`;
						if (json.example) {
							example = `Example: ${json.example}`;
						}
					} else {
						message = 'No matches found';
					}

					Spudnik.processMessage(new RichEmbed({
						color: Spudnik.Config.getDefaultEmbedColor(),
						title,
						description: message,
						footer: {
							text: example,
						},
					}), msg, false, false);
				});
			},
		},
	};
};
