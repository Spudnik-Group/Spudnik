import { stripIndents } from 'common-tags';
import { GuildMember, Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Change the bot's nickname on your server, or reset it.
 *
 * @export
 * @class NickCommand
 * @extends {Command}
 */
export default class NickCommand extends Command {
	/**
	 * Creates an instance of NickCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof NickCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					default: '',
					key: 'nickName',
					prompt: 'what is the nickname you\'d like to set?\n',
					type: 'string'
				}
			],
			description: 'Used to change the bot\'s nickname on your server, or reset it.',
			details: stripIndents`
				syntax: \`!nick (new nickname)\`

				Supplying no nickname resets the nickname to default.

				Manage Nicknames permission required.
			`,
			examples: [
				'!nick',
				'!nick AwesomeBot'
			],
			group: 'util',
			guildOnly: true,
			memberName: 'nick',
			name: 'nick',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Determine if a member has permission to run the "nick" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {boolean}
	 * @memberof NickCommand
	 */
	public hasPermission(msg: CommandMessage): boolean {
		return this.client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_NICKNAMES');
	}

	/**
	 * Run the "nick" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof NickCommand
	 */
	public async run(msg: CommandMessage, args: { nickName: string }): Promise<Message | Message[]> {
		if (args.nickName === '' || args.nickName === undefined) {
			(msg.guild.me as GuildMember).setNickname('Spudnik', 'A Spudnik command was run to reset it.');
			return sendSimpleEmbeddedMessage(msg, 'Bot nickname cleared.');
		} else {
			(msg.guild.me as GuildMember).setNickname(args.nickName, 'A Spudnik command was run to set it.');
			return sendSimpleEmbeddedMessage(msg, 'Bot nickname set.');
		}
	}
}
