import { oneLine } from 'common-tags';
import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

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
			description: 'Used to change the default embed color the bot uses for responses, or reset it.',
			details: oneLine`
				syntax: \`!embedcolor (hex color)\`\n
				\n
				Supplying no hex color resets the embed color to default.\n
				\n
				Manage Guild permission required.
			`,
			examples: [
				'!embedcolor',
				'!embedcolor 5592405'
			],
			group: 'util',
			guildOnly: true,
			memberName: 'embedcolor',
			name: 'embedcolor',
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
		return this.client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_GUILD');
	}

	/**
	 * Run the "embedColor" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof EmbedColorCommand
	 */
	public async run(msg: CommandMessage, args: { color: string }): Promise<Message | Message[]> {
		const response = await sendSimpleEmbeddedMessage(msg, 'Loading...');
		if (args.color === '') {
			msg.client.provider.remove(msg.guild, 'embedColor')
				.then(() => {
					return sendSimpleEmbeddedMessage(msg, 'Default Embed Color cleared.');
				})
				.catch((err: Error) => {
					msg.client.emit('warn', `Error in command util:embedcolor: ${err}`);
					return sendSimpleEmbeddedError(msg, 'There was an error processing the request.', 3000);
				});
		} else {
			msg.client.provider.set(msg.guild, 'embedColor', args.color)
				.then(() => {
					return sendSimpleEmbeddedMessage(msg, `Default Embed Color changed to: ${args.color}. How do I look?`);
				})
				.catch((err: Error) => {
					msg.client.emit('warn', `Error in command util:embedcolor: ${err}`);
					return sendSimpleEmbeddedError(msg, 'There was an error processing the request.', 3000);
				});
		}
		return response;
	}
}
