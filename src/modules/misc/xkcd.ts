import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import * as request from 'request';
import { RequestResponse } from 'request';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Post an XKCD comic.
 * 
 * @export
 * @class XkcdCommand
 * @extends {Command}
 */
export default class XkcdCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Displays a given XKCD comic number (or the latest if nothing specified)',
			details: '[comicNumber]',
			group: 'misc',
			guildOnly: true,
			memberName: 'xkcd',
			name: 'xkcd',
			throttling: {
				duration: 3,
				usages: 2,
			},
			args: [
				{
					default: '',
					key: 'comicNumber',
					prompt: 'what comic number would you like to see?\n',
					type: 'string',
				},
			],
		});
	}

	/**
	 * Run the "xkcd" command.
	 * 
	 * @param {CommandMessage} msg 
	 * @param {{ comicNumber: string }} args 
	 * @returns {(Promise<Message | Message[]>)} 
	 * @memberof XkcdCommand
	 */
	public async run(msg: CommandMessage, args: { comicNumber: string }): Promise<Message | Message[]> {
		let url: string = 'http://xkcd.com/';
		if (args.comicNumber !== '') {
			url += `${args.comicNumber}/`;
		}
		url += 'info.0.json';
		request({ url }, (err: Error, res: RequestResponse, body: string) => {
			try {
				const comic = JSON.parse(body);
				msg.delete();
				return msg.embed({
					color: 5592405,
					title: `XKCD ${comic.num} ${comic.title}`,
					image: {
						url: comic.img,
					},
					footer: {
						text: comic.alt,
					},
				});
			} catch (err) {
				return sendSimpleEmbeddedError(msg, `Couldn't fetch an XKCD for ${args.comicNumber}`);
			}
		});
		return sendSimpleEmbeddedMessage(msg, 'Loading...');;
	}
}
