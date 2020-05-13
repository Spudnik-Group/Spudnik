/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, User, Permissions } from 'discord.js';
import { modLogMessage } from '@lib/helpers/custom-helpers';
import { Command, CommandStore, KlasaMessage, Timestamp } from 'klasa';
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
			usage: '<user:user> [reason:...string]'
		});
	}

	/**
	 * Run the "unban" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ user: GuildMember, reason: string }} args
	 * @returns {(Promise<Message | Message[] | any>)}
	 * @memberof UnBanCommand
	 */
	public async run(msg: KlasaMessage, [user, reason]: [User, string]): Promise<KlasaMessage | KlasaMessage[]> {
		const unbanEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.UnBan);

		try {
			await msg.guild.members.unban(user, `Un-Banned by: ${msg.author.tag} (${msg.author.id}) for: ${reason}`);

			// Set up embed message
			unbanEmbed.setDescription(stripIndents`
				**Moderator:** ${msg.author.tag} (${msg.author.id})
				**User:** ${user.tag} (${user.id})
				**Action:** UnBan
				**Reason:** ${reason}`);

			await modLogMessage(msg, unbanEmbed);

			// Send the success response
			return msg.sendEmbed(unbanEmbed);
		} catch (err) {
			return this.catchError(msg, { user, reason }, err);
		}
	}

	private catchError(msg: KlasaMessage, args: { user: User; reason: string }, err: Error): Promise<KlasaMessage | KlasaMessage[]> {
		// Emit warn event for debugging
		msg.client.emit('warn', stripIndents`
		Error occurred in \`unban\` command!
		**Server:** ${msg.guild.name} (${msg.guild.id})
		**Author:** ${msg.author.tag} (${msg.author.id})
		**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display(msg.createdTimestamp)}
		**Input:** \`${args.user.tag} (${args.user.id})\` || \`${args.reason}\`
		**Error Message:** ${err}`);

		// Inform the user the command failed
		return msg.sendSimpleError(`Unbanning ${args.user} for ${args.reason} failed!`, 3000);
	}

}
