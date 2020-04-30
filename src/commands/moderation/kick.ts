/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { GuildMember, MessageEmbed, Permissions } from 'discord.js';
import { Command, CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { specialEmbed, specialEmbedTypes } from '@lib/helpers/embed-helpers';
import { modLogMessage } from '@lib/helpers/custom-helpers';

/**
 * Kick a member from the guild.
 *
 * @export
 * @class KickCommand
 * @extends {Command}
 */
export default class KickCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Kicks a user.',
			name: 'kick',
			permissionLevel: 3, // KICK_MEMBERS
			requiredPermissions: Permissions.FLAGS.KICK_MEMBERS,
			usage: '<member:member> [reason:...string]'
		});
	}

	/**
	 * Run the "kick" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ member: GuildMember, reason: string }} args
	 * @returns {(Promise<Message | Message[] | any>)}
	 * @memberof KickCommand
	 */
	public async run(msg: KlasaMessage, [member, reason]: [GuildMember, string]): Promise<KlasaMessage | KlasaMessage[]> {
		const memberToKick: GuildMember = member;
		const kickEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.Kick);

		// Check if user is able to kick the mentioned user
		if (!memberToKick.kickable || !(msg.member.roles.highest.comparePositionTo(memberToKick.roles.highest) > 0)) {
			return msg.sendSimpleError(`I can't kick ${memberToKick}. Do they have the same or a higher role than me or you?`, 3000);
		}

		try {
			await memberToKick.kick(`Kicked by: ${msg.author.tag} (${msg.author.id}) for: ${reason}`);
			// Set up embed message
			kickEmbed.setDescription(stripIndents`
				**Moderator:** ${msg.author.tag} (${msg.author.id})
				**Member:** ${memberToKick.user.tag} (${memberToKick.id})
				**Action:** Kick
				**Reason:** ${reason}
			`);

			await modLogMessage(msg, kickEmbed);

			// Send the success response
			return msg.sendEmbed(kickEmbed);
		} catch (err) {
			// Emit warn event for debugging
			msg.client.emit('warn', stripIndents`
			Error occurred in \`kick\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display(msg.createdTimestamp)}
			**Input:** \`${member.user.tag} (${member.id})\` || \`${reason}\`
			**Error Message:** ${err}`);

			// Inform the user the command failed
			return msg.sendSimpleError(`Kicking ${member} for ${reason} failed!`, 3000);
		}
	}

}
