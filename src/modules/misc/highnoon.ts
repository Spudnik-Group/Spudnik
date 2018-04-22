import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import * as request from 'request';
import { RequestResponse } from 'request';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedImage, sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Show the XKCD "Now" comic.
 * 
 * @export
 * @class HighNoonCommand
 * @extends {Command}
 */
export default class HighNoonCommand extends Command {
	/**
	 * Creates an instance of HighNoonCommand.
	 * 
	 * @param {CommandoClient} client 
	 * @memberof HighNoonCommand
	 */
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

	/**
	 * Run the "highnoon" command.
	 * 
	 * @param {CommandMessage} msg 
	 * @returns {(Promise<Message | Message[]>)} 
	 * @memberof HighNoonCommand
	 */
	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		request({
			uri: 'http://imgs.xkcd.com/comics/now.png',
			followAllRedirects: true,
		}, (err: Error, resp: RequestResponse) => {
			if (resp.request.uri.href) {
				return sendSimpleEmbeddedImage(msg, resp.request.uri.href.toString());
			} else {
				return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?');
			}
		});
		return sendSimpleEmbeddedMessage(msg, 'Loading...');
	}
}
