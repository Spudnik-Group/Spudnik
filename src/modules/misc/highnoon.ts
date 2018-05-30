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
			examples: ['!highnoon'],
			group: 'misc',
			guildOnly: true,
			memberName: 'highnoon',
			name: 'highnoon',
			throttling: {
				duration: 3,
				usages: 2
			}
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
		const response = await sendSimpleEmbeddedMessage(msg, 'Loading...');
		request({
			followAllRedirects: true,
			uri: 'http://imgs.xkcd.com/comics/now.png'
		}, (err: Error, resp: RequestResponse) => {
			if (resp.request.uri.href) {
				return sendSimpleEmbeddedImage(msg, resp.request.uri.href.toString());
			} else {
				msg.client.emit('warn', `Error in command misc:highnoon: ${err}`);
				return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
			}
		});
		return response;
	}
}
