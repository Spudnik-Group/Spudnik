import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import * as rp from 'request-promise';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedImage, startTyping, stopTyping } from '../../lib/helpers';
import { deleteCommandMessages } from '../../lib/custom-helpers';

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
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof HighNoonCommand
	 */
	public async run(msg: CommandoMessage): Promise<Message | Message[]> {
		startTyping(msg);
		
		return rp({ followAllRedirects: true, uri: 'http://imgs.xkcd.com/comics/now.png', resolveWithFullResponse: true })
			.then((content) => {
				deleteCommandMessages(msg);
				stopTyping(msg);
				
				// Send the success response
				return sendSimpleEmbeddedImage(msg, content.request.uri.href.toString());
			})
			.catch((err: Error) => {
				msg.client.emit('warn', `Error in command misc:highnoon: ${err}`);
				stopTyping(msg);
				
				return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
			});
	}
}
