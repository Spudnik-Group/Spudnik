/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { GuildMember, MessageEmbed, Role, Permissions } from 'discord.js';
import { getEmbedColor, modLogMessage, sendSimpleEmbeddedError } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage, Timestamp } from 'klasa';

/**
 * Ban a member and optionally delete past messages.
 *
 * @export
 * @class BanCommand
 * @extends {Command}
 */
export default class BanCommand extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Bans the member, with a supplied reason',
			name: 'ban',
			permissionLevel: 4, // BAN_MEMBERS
			requiredPermissions: Permissions.FLAGS.BAN_MEMBERS,
			usage: '<member:user> <reason:...string>'
		});
	}

	/**
	 * Run the "ban" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ member: KlasaUser, reason: string, daysOfMessages: number }} args
	 * @returns {(Promise<Message | Message[] | any>)}
	 * @memberof BanCommand
	 */
	public async run(msg: KlasaMessage, [member, reason]): Promise<KlasaMessage | KlasaMessage[]> {
		const banEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/hammer_1f528.png',
				name: 'Ban Hammer'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();

		try {
			// Check if user is a guild member
			const memberToBan: GuildMember = msg.guild.member(member);
	
			if (memberToBan) {
				// User is a guild member
				const highestRoleOfCallingMember: Role = msg.member.roles.highest;
	
				// Check if user is able to ban the mentioned user
				if (!memberToBan.bannable || !(highestRoleOfCallingMember.comparePositionTo(memberToBan.roles.highest) > 0)) {
					return sendSimpleEmbeddedError(msg, `I can't ban <@${memberToBan.id}>. Do they have the same or a higher role than me or you?`, 3000);
				}
	
				// Ban
				await memberToBan.ban({ reason: `Banned by: ${msg.author.tag} (${msg.author.id}) for: ${reason}` });
			} else {
				// User is not a guild member
				await msg.guild.members.ban(member, { reason: `Banned by: ${msg.author.tag} (${msg.author.id}) for: ${reason}` });
			}
	
			// Set up embed message
			banEmbed.setDescription(stripIndents`
				**Moderator:** ${msg.author.tag} (${msg.author.id})
				**Member:** ${member.user ? member.user.tag : member.tag} (${member.id})
				**Action:** Ban
				**Reason:** ${reason}`);
	
			modLogMessage(msg, banEmbed);
	
			// Send the success response
			return msg.sendEmbed(banEmbed);
		} catch (err) {
			this.catchError(msg, { member: member, reason: reason }, err);
		}
	}

	private catchError(msg: KlasaMessage, args: { member: any, reason: string }, err: Error): Promise<KlasaMessage | KlasaMessage[]> {
		// Emit warn event for debugging
		msg.client.emit('warn', stripIndents`
			Error occurred in \`ban\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display(msg.createdTimestamp)}
			**Input:** \`${args.member.user ? args.member.user.tag : args.member.tag} (${args.member.id})\` || \`${args.reason}\`
			**Error Message:** ${err}
		`);

		// Inform the user the command failed
		return sendSimpleEmbeddedError(msg, `Banning ${args.member} for ${args.reason} failed!`, 3000);
	}
}
