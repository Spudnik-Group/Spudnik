import { Message, RichEmbed } from 'discord.js';
import * as request from 'request';
import { RequestResponse } from 'request';
import { Spudnik } from '../spudnik';

//tslint:disable-next-line
const xml2js = require('xml2js');

module.exports = (Spudnik: Spudnik) => {
	const parser = new xml2js.Parser();
	return {
		commands: [
			'define',
		],
		// tslint:disable:object-literal-sort-keys
		define: {
			usage: '<word>',
			description: 'Looks up a word in the Merriam-Webster Collegiate Dictionary',
			process: (msg: Message, suffix: string) => {
				const word = suffix;
				if (!word) {
					return Spudnik.processMessage(new RichEmbed({
						color: Spudnik.Config.getDefaultEmbedColor(),
						description: 'I won\'t define an empty string.',
					}), msg, false, false);
				}

				request(`http://www.dictionaryapi.com/api/v1/references/collegiate/xml/${word}?key=${Spudnik.Auth.getDictionaryApiKey()}`, (err: Error, res: RequestResponse, body: any) => {
					let definitionResult = '';
					parser.parseString(body, (err: Error, result: any) => {
						const wordList = result.entry_list.entry;
						let phonetic = '';
						phonetic += wordList[0].pr.map((entry: any) => {
							if (typeof entry === 'object') {
								return entry._;
							}
							return entry;
						}).join('\n');
						definitionResult += `*[${phonetic}]*\n`;
						definitionResult += `Hear it: http://media.merriam-webster.com/soundc11/${wordList[0].sound[0].wav[0].slice(0, 1)}/${wordList[0].sound[0].wav[0]}\n\n`;
						wordList.forEach((wordResult: any) => {
							let defList = '';
							let defArray = wordResult.def[0].dt;
							if (wordResult.ew[0] !== word) {
								return;
							}
							definitionResult += '__' + wordResult.fl[0] + '__\n';
							defArray = defArray.filter((item: any) => {
								if (typeof item === 'object') {
									item._ = item._.trim();
									return item._ !== ':';
								}
								item = item.trim();
								return item !== ':';
							});
							defList += defArray.map((entry: any) => {
								if (typeof entry === 'object') {
									return entry._;
								}
								return entry;
							}).join('\n');
							definitionResult += `${defList}\n\n`;
						});

						Spudnik.processMessage(new RichEmbed({
							color: Spudnik.Config.getDefaultEmbedColor(),
							title: word,
							description: definitionResult,
							footer: {
								text: 'powered by Merriam-Webster\'s Collegiate® Dictionary',
								icon_url: 'http://www.dictionaryapi.com/images/info/branding-guidelines/mw-logo-light-background-50x50.png',
							},
						}), msg, false, false);
					});
				});
			},
		},
	};
};
