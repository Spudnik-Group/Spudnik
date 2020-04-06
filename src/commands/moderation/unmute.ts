/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { MessageEmbed, Permissions, GuildMember } from 'discord.js';
import { modLogMessage } from '@lib/helpers/custom-helpers';
import { stripIndents } from 'common-tags';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { specialEmbed } from '@lib/helpers/embed-helpers';

export default class UnmuteCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Unmutes a mentioned user.',
			permissionLevel: 6, // MANAGE_GUILD
			requiredPermissions: Permissions.FLAGS.MANAGE_ROLES,
			requiredSettings: ['roles.muted'],
			usage: '<member:member> [reason:...string]'
		});
	}

	public async run(msg: KlasaMessage, [member, reason]: [GuildMember, string]): Promise<KlasaMessage | KlasaMessage[]> {
		const muteEmbed: MessageEmbed = specialEmbed(msg, 'un-mute');

		// Check if user is able to mute the mentioned user
		if (member.roles.highest.position >= msg.member.roles.highest.position) {
			return msg.sendSimpleError('You cannot unmute this user. Do they have the same or higher role than you?', 3000);
		}
		// Check if the mentioned user is already muted
		if (!member.roles.has(msg.guild.settings.get(GuildSettings.Roles.Muted))) {
			return msg.sendSimpleError('The member is not muted.', 3000);
		}

		try {
			await member.roles.remove(msg.guild.settings.get(GuildSettings.Roles.Muted));
			// Set up embed message
			muteEmbed.setDescription(stripIndents`
					**Moderator:** ${msg.author.tag} (${msg.author.id})
					**Member:** ${member.user.tag} (${member.id})
					**Action:** UnMute
					**Reason:** ${reason ? reason : 'no reason'}
				`);

			await modLogMessage(msg, muteEmbed);

			// Send the success response
			return msg.sendEmbed(muteEmbed);
		} catch (err) {
			// Emit warn event for debugging
			msg.client.emit('warn', stripIndents`
				Error occurred in \`unmute\` command!
				**Server:** ${msg.guild.name} (${msg.guild.id})
				**Author:** ${msg.author.tag} (${msg.author.id})
				**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display(msg.createdTimestamp)}
				**Input:** \`${member.user.tag} (${member.id})\` || \`${reason}\`
				**Error Message:** ${err}`);

			// Inform the user the command failed
			return msg.sendSimpleError(`UnMuting ${member} for ${reason ? reason : 'no reason'} failed!`, 3000);
		}
	}

}
