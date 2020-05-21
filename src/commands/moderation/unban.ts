/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, Permissions, User } from 'discord.js';
import { Command, CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { modLogMessage } from '@lib/helpers/custom-helpers';
import { specialEmbed, specialEmbedTypes } from '@lib/helpers/embed-helpers';

/**
 * Unban a member.
 *
 * @export
 * @class UnBanCommand
 * @extends {Command}
 */
export default class UnBanCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Un-Bans the user.',
			permissionLevel: 4, // BAN_MEMBERS
			requiredPermissions: Permissions.FLAGS.BAN_MEMBERS,
			usage: '<member:user> [reason:...string]'
		});
	}

	/**
	 * Run the "unban" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ user: User, reason: string }} args
	 * @returns {(Promise<Message | Message[] | any>)}
	 * @memberof UnBanCommand
	 */
	public async run(msg: KlasaMessage, [member, reason]: [User, string]): Promise<KlasaMessage | KlasaMessage[]> {
		const unbanEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.UnBan);

		try {
			await msg.guild.members.unban(member, `Un-Banned by: ${msg.author.tag} (${msg.author.id}) for: ${reason}`);

			// Set up embed message
			unbanEmbed.setDescription(stripIndents`
				**Moderator:** ${msg.author.tag} (${msg.author.id})
				**User:** ${member.tag} (${member.id})
				**Action:** Unban
				**Reason:** ${reason || '_None provided_'}`);

			await modLogMessage(msg, unbanEmbed);

			// Send the success response
			return msg.sendEmbed(unbanEmbed);
		} catch (err) {
			// Emit warn event for debugging
			msg.client.emit('warn', stripIndents`
			Error occurred in \`kick\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display(msg.createdTimestamp)}
			**Input:** \`${member.tag} (${member.id})\` || \`${reason}\`
			**Error Message:** ${err}`);

			// Inform the user the command failed
			return msg.sendSimpleError(`Unbanning ${member}${reason ? ` for ${reason}` : ''} failed!`, 3000);
		}
	}

}
