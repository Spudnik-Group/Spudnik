import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage, deleteCommandMessages } from '../../lib/helpers';

/**
 * Generates a "Let Me Google That For You" link.
 *
 * @export
 * @class LmgtfyCommand
 * @extends {Command}
 */
export default class LmgtfyCommand extends Command {
	/**
	 * Creates an instance of LmgtfyCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof LmgtfyCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'query',
					parse: (query: string) => require('remove-markdown')(query),
					prompt: 'What should I Google for that n00b?\n',
					type: 'string'
				}
			],
			description: 'Returns a Let Me Google That For You link, so you can school a n00b.',
			details: 'syntax: `!lmgtfy <query>`',
			examples: ['!lmgtfy port forwarding'],
			group: 'misc',
			guildOnly: true,
			memberName: 'lmgtfy',
			name: 'lmgtfy',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "lmgtfy" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof LmgtfyCommand
	 */
	public async run(msg: CommandoMessage, args: { query: string }): Promise<Message | Message[]> {
		deleteCommandMessages(msg, this.client);
		
		return sendSimpleEmbeddedMessage(msg, `<http://lmgtfy.com/?q=${encodeURI(args.query)}>`);
	}
}
