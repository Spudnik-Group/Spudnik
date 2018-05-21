import { GuildMember, Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

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
				usages: 2
			},
			args: [
				{
					key: 'member',
					prompt: 'who needs the boot?\n',
					type: 'member'
				},
				{
					key: 'reason',
					prompt: 'why do you want to kick this noob?\n',
					type: 'string'
				}
			]
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
		return msg.client.isOwner(msg.author) || msg.member.hasPermission(['KICK_MEMBERS']);
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
		const memberToKick: GuildMember = args.member;
		const kickEmbed: MessageEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			author: {
				name: 'Das Boot',
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/eject-symbol_23cf.png'
			},
			description: ''
		});

		if (!memberToKick.kickable || !(msg.member.roles.highest.comparePositionTo(memberToKick.roles.highest) > 0)) {
			return sendSimpleEmbeddedError(msg, `I can't kick ${memberToKick}. Do they have the same or a higher role than me or you?`);
		}
		memberToKick.kick(args.reason)
			.then(() => {
				kickEmbed.description = `Kicking ${memberToKick} from ${msg.guild} for ${args.reason}!`;
				return msg.embed(kickEmbed);
			})
			.catch((err: Error) => {
				msg.client.emit('error', `Error with command 'ban'\nBanning ${memberToKick} from ${msg.guild} failed!\nError: ${err}`);
				return sendSimpleEmbeddedMessage(msg, `Kicking ${memberToKick} failed!`);
			});
		return sendSimpleEmbeddedMessage(msg, 'Loading...');
	}
}
