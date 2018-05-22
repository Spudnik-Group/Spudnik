import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Change the default embed color for the server.
 *
 * @export
 * @class EmbedColorCommand
 * @extends {Command}
 */
export default class EmbedColorCommand extends Command {
	/**
	 * Creates an instance of EmbedColorCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof EmbedColorCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Change the default embed color the bot uses for responses.',
			group: 'util',
			guildOnly: true,
			memberName: 'embedcolor',
			name: 'embedcolor',
			args: [
				{
					default: '',
					key: 'color',
					prompt: 'What color would you like embeds to be?\n',
					type: 'string',
					validate: (color: string) => {
						if (!isNaN(color.match(/^ *[a-f0-9]+ *$/i) ? parseInt(color, 16) : NaN)) {
							return true;
						} else if (color === '') {
							return true;
						}
						return 'You provided an invalid color hex number. Please try again.';
					}
				}
			],
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Determine if a member has permission to run the "embedColor" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {boolean}
	 * @memberof EmbedColorCommand
	 */
	public hasPermission(msg: CommandMessage): boolean {
		return this.client.isOwner(msg.author) || msg.member.hasPermission(['ADMINISTRATOR', 'MANAGE_GUILD'], { checkAdmin: true, checkOwner: true });
	}

	/**
	 * Run the "embedColor" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof EmbedColorCommand
	 */
	public async run(msg: CommandMessage, args: { color: string }): Promise<Message | Message[]> {
		if (args.color === '') {
			msg.client.provider.remove(msg.guild, 'embedColor');
			return sendSimpleEmbeddedMessage(msg, 'Default Embed Color cleared.');
		} else {
			msg.client.provider.set(msg.guild, 'embedColor', args.color);
			return sendSimpleEmbeddedMessage(msg, `Default Embed Color changed to: ${args.color}. How do I look?`);
		}
	}
}
