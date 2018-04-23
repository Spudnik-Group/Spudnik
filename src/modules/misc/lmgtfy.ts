import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';

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
			description: 'Let Me Google that for You.',
			group: 'misc',
			guildOnly: true,
			memberName: 'lmgtfy',
			name: 'lmgtfy',
			throttling: {
				duration: 3,
				usages: 2,
			},
			args: [
				{
					key: 'query',
					prompt: 'what should I Google for that noob?\n',
					type: 'string',
				},
			],
		});
	}

	/**
	 * Run the "lmgtfy" command.
	 * 
	 * @param {CommandMessage} msg 
	 * @param {{ query: string }} args 
	 * @returns {(Promise<Message | Message[]>)} 
	 * @memberof LmgtfyCommand
	 */
	public async run(msg: CommandMessage, args: { query: string }): Promise<Message | Message[]> {
		msg.delete();
		return sendSimpleEmbeddedMessage(msg, `<http://lmgtfy.com/?q=${encodeURI(require('remove-markdown')(args.query))}>`);
	}
}
