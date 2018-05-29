import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { resolveMention, sendSimpleEmbeddedImage } from '../../lib/helpers';

/**
 * Post the "gitgud" image at someone.
 *
 * @export
 * @class GitGudCommand
 * @extends {Command}
 */
export default class GitGudCommand extends Command {
	/**
	 * Creates an instance of GitGudCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof GitGudCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					default: '',
					key: 'mention',
					prompt: 'Who should gitgud?',
					type: 'string'
				}
			],
			description: 'Informs someone that they should "git gud".',
			group: 'random',
			guildOnly: true,
			memberName: 'gitgud',
			name: 'gitgud',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "gitgud" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ mention: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof GitGudCommand
	 */
	public async run(msg: CommandMessage, args: { mention: string }): Promise<Message | Message[]> {
		if (args.mention && args.mention !== null) {
			return msg.embed({ image: { url: 'http://i.imgur.com/NqpPXHu.jpg' } }, '', {
				reply: resolveMention(args.mention)
			});
		}
		return sendSimpleEmbeddedImage(msg, 'http://i.imgur.com/NqpPXHu.jpg');
	}
}
