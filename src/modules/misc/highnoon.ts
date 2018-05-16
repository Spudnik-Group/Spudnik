import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import * as rp from 'request-promise';
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
		const response = await sendSimpleEmbeddedMessage(msg, 'Loading...');
		const options = {
			method: 'GET',
			uri: 'http://imgs.xkcd.com/comics/now.png',
			followAllRedirects: true,
			json: true,
		};

		rp(options)
			.then((resp) => {
				if (resp.uri.href) {
					msg.delete();
					return sendSimpleEmbeddedImage(msg, resp.uri.href.toString());
				} else {
					msg.delete();
					msg.client.emit('warn', `Unsuccessful request.\nCommand: 'highnoon'\nContext: ${resp}`);
					return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 300);
				}
			})
			.catch((err) => {
				msg.delete();
				msg.client.emit('error', `Error with command 'highnoon'\nError: ${err}`);
				return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 300);
			});
		return response;
	}
}
