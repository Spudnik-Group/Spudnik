import { Message } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';
import { deleteCommandMessages } from '../../lib/custom-helpers';

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
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
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
	 * @param {KlasaMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof LmgtfyCommand
	 */
	public async run(msg: KlasaMessage, args: { query: string }): Promise<KlasaMessage | KlasaMessage[]> {
		deleteCommandMessages(msg);
		
		return sendSimpleEmbeddedMessage(msg, `<http://lmgtfy.com/?q=${encodeURI(args.query)}>`);
	}
}
