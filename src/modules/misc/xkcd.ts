import { stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import * as rp from 'request-promise';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage, startTyping, stopTyping, deleteCommandMessages } from '../../lib/helpers';

/**
 * Post an XKCD comic.
 *
 * @export
 * @class XkcdCommand
 * @extends {Command}
 */
export default class XkcdCommand extends Command {
	/**
	 * Creates an instance of XkcdCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof XkcdCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					default: '',
					key: 'comicNumber',
					prompt: 'What comic number would you like to see?\n',
					type: 'string',
					validate: (comicNumber: number) => {
						if (!isNaN(Number(comicNumber)) && Number.isInteger(Number(comicNumber)) && comicNumber > 0) { return true; }
						return 'Invalid comic number.';
					}
				}
			],
			description: 'Returns a given XKCD comic number (or the latest if nothing specified)',
			details: stripIndents`
				syntax: \`!xkcd (comic number)\`

				Supplying no comic number returns the latest comic.`,
			examples: [
				'!xkcd',
				'!xkcd 323'
			],
			group: 'misc',
			guildOnly: true,
			memberName: 'xkcd',
			name: 'xkcd',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "xkcd" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ comicNumber: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof XkcdCommand
	 */
	public async run(msg: CommandoMessage, args: { comicNumber: string }): Promise<Message | Message[]> {
		const xkcdEmbed: MessageEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();
		let url: string = 'http://xkcd.com/';
		if (args.comicNumber !== '') {
			url += `${args.comicNumber}/`;
		}
		url += 'info.0.json';

		startTyping(msg);

		rp(url)
			.then((content) => {
				const comic = JSON.parse(content);
				xkcdEmbed.setFooter(comic.alt);
				xkcdEmbed.setImage(comic.img);
				xkcdEmbed.setTitle(`XKCD ${comic.num} ${comic.title}`);
			})
			.catch((err: Error) => {
				msg.client.emit('warn', `Error in command misc:xkcd: ${err}`);
				stopTyping(msg);
				return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
			});
		
		deleteCommandMessages(msg, this.client);
		stopTyping(msg);

		// Send the success response
		return msg.embed(xkcdEmbed);
	}
}
