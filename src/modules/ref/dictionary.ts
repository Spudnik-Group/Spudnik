import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import * as request from 'request';
import { RequestResponse } from 'request';
import { sendSimpleEmbeddedError } from '../../lib/helpers';

export default class DefineCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Looks up a word in the Merriam-Webster Collegiate Dictionary.',
			group: 'ref',
			guildOnly: true,
			memberName: 'define',
			name: 'define',
			throttling: {
				duration: 3,
				usages: 2,
			},
			args: [
				{
					key: 'query',
					prompt: 'what should I look up in the dictionary?\n',
					type: 'string',
				},
			],
		});
	}

	public async run(msg: CommandMessage, args: { query: string }): Promise<Message | Message[]> {
		const word = args.query;

		request(`http://www.dictionaryapi.com/api/v1/references/collegiate/xml/${word}?key=${msg.client.provider.get(msg.guild, 'dictionaryApiKey')}`, (err: Error, res: RequestResponse, body: any) => {
			let definitionResult = '';
			require('xml2js').Parser().parseString(body, (err: Error, result: any) => {
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

				return msg.embed({
					color: 5592405,
					title: word,
					description: definitionResult,
					footer: {
						text: 'powered by Merriam-Webster\'s Collegiate® Dictionary',
						icon_url: 'http://www.dictionaryapi.com/images/info/branding-guidelines/mw-logo-light-background-50x50.png',
					},
				});
			});
		});
		return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?');
	}
}
