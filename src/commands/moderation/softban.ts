/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { GuildMember, MessageEmbed, Permissions } from 'discord.js';
import { modLogMessage } from '@lib/helpers/custom-helpers';
import { stripIndents } from 'common-tags';
import { specialEmbed } from '@lib/helpers/embed-helpers';

export default class SoftbanCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Soft-Bans the user, with a supplied reason',
			permissionLevel: 4, // BAN_MEMBERS
			requiredPermissions: Permissions.FLAGS.BAN_MEMBERS,
			usage: '<member:member> <reason:...string> [when:time]'
		});
	}

	public async run(msg: KlasaMessage, [member, reason, when]: [GuildMember, string, string]): Promise<KlasaMessage | KlasaMessage[]> {
		const banEmbed: MessageEmbed = specialEmbed(msg, 'soft-ban');

		// Check if user is able to ban the mentioned user
		if (!member.bannable || member.roles.highest.position >= msg.member.roles.highest.position) {
			return msg.sendSimpleError(`I can't soft-ban <@${member.id}>. Do they have the same or a higher role than me or you?`, 3000);
		}

		try {
			// Ban
			await msg.guild.members.ban(member, { reason: `Soft-Banned by: ${msg.author.tag} (${msg.author.id}) for: ${reason}` });

			if (when) {
				await this.client.schedule.create('unban', when, {
					data: {
						guild: msg.guild.id,
						user: member.id,
						reason: 'Softban released.'
					}
				});
			} else {
				await msg.guild.members.unban(member, 'Softban released.');
			}

			// Set up embed message
			banEmbed.setDescription(stripIndents`
			**Moderator:** ${msg.author.tag} (${msg.author.id})
			**Member:** ${member.user.tag} (${member.id})
			**Action:** Soft Ban
			**Reason:** ${reason}`);

			await modLogMessage(msg, banEmbed);

			// Send the success response
			return msg.sendEmbed(banEmbed);
		} catch (err) {
			return this.catchError(msg, { member, reason }, err);
		}
	}

	private catchError(msg: KlasaMessage, args: { member: GuildMember; reason: string }, err: Error): Promise<KlasaMessage | KlasaMessage[]> {
		// Emit warn event for debugging
		msg.client.emit('warn', stripIndents`
			Error occurred in \`softban\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display(msg.createdTimestamp)}
			**Input:** \`${args.member.user.tag} (${args.member.id})\` || \`${args.reason}\`
			**Error Message:** ${err}
		`);

		// Inform the user the command failed
		return msg.sendSimpleError(`Soft-Banning ${args.member} for ${args.reason} failed!`, 3000);
	}

}
