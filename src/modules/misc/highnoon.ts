import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import * as request from 'request';
import { RequestResponse } from 'request';
import { sendSimpleEmbededError, sendSimpleEmbededImage } from '../../lib/helpers';

export default class HighNoonCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Displays the High Noon XKCD comic.',
			group: 'misc',
			guildOnly: true,
			memberName: 'highnoon',
			name: 'highnoon',
			throttling: {
				duration: 3,
				usages: 2,
			},
		});
	}

	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		request({
			uri: 'http://imgs.xkcd.com/comics/now.png',
			followAllRedirects: true,
		}, (err: Error, resp: RequestResponse) => {
			if (resp.request.uri.href) {
				return sendSimpleEmbededImage(msg, resp.request.uri.href.toString());
			}
		});
		return sendSimpleEmbededError(msg, 'There was an error with the request. Try again?');
	}
}
