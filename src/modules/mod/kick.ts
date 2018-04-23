import { GuildMember, Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Kick a member from the guild.
 *
 * @export
 * @class KickCommand
 * @extends {Command}
 */
export default class KickCommand extends Command {
	/**
	 * Creates an instance of KickCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof KickCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Kicks the user.',
			details: '<user> [reason] [daysOfMessages]',
			group: 'mod',
			guildOnly: true,
			memberName: 'kick',
			name: 'kick',
			throttling: {
				duration: 3,
				usages: 2,
			},
			args: [
				{
					key: 'member',
					prompt: 'who needs the boot?\n',
					type: 'member',
				},
				{
					key: 'reason',
					prompt: 'why do you want to kick this noob?\n',
					type: 'string',
				},
			],
		});
	}

	/**
	 * Determine if a member has permission to run the "kick" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {boolean}
	 * @memberof KickCommand
	 */
	public hasPermission(msg: CommandMessage): boolean {
		return this.client.isOwner(msg.author) || msg.member.hasPermission('KICK_MEMBERS');
	}

	/**
	 * Run the "kick" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ member: GuildMember, reason: string }} args
	 * @returns {(Promise<Message | Message[] | any>)}
	 * @memberof KickCommand
	 */
	public async run(msg: CommandMessage, args: { member: GuildMember, reason: string }): Promise<Message | Message[] | any> {
		const memberToKick = args.member;

		if (memberToKick !== undefined) {
			if (!memberToKick.kickable || !(msg.member.roles.highest.comparePositionTo(memberToKick.roles.highest) > 0)) {
				return sendSimpleEmbeddedMessage(msg, `I can't kick ${memberToKick}. Do they have the same or a higher role than me or you?`);
			}
			memberToKick.kick(args.reason).then(() => {
				return sendSimpleEmbeddedMessage(msg, `Kicking ${memberToKick} from ${msg.guild} for ${args.reason}!`);
			}).catch(() => sendSimpleEmbeddedMessage(msg, `Kicking ${memberToKick} failed!`));
		} else {
			return sendSimpleEmbeddedMessage(msg, 'You must specify a valid user to kick.');
		}
	}
}
