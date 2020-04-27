/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, Role, Permissions } from 'discord.js';
import { modLogMessage } from '@lib/helpers/custom-helpers';
import { Command, CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { specialEmbed } from '@lib/helpers/embed-helpers';

/**
 * Manage setting a mute role.
 *
 * @export
 * @class MuteRoleCommand
 * @extends {Command}
 */
export default class MuteRoleCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: [
				'mr'
			],
			description: 'Used to configure the role for the `mute` command.',
			extendedHelp: stripIndents`
				If no role is provided, the default role is cleared.
			`,
			name: 'mute-role',
			permissionLevel: 2,
			requiredPermissions: Permissions.FLAGS.MANAGE_ROLES,
			usage: '[role:role]'
		});
	}

	/**
	 * Run the "mute-role" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {Role} [role]
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof RoleManagementCommands
	 */
	public async run(msg: KlasaMessage, [role]: [Role]): Promise<KlasaMessage | KlasaMessage[]> {
		const roleEmbed = specialEmbed(msg, 'role-manager');
		const guildMuteRole = await msg.guild.roles.fetch(msg.guild.settings.get(GuildSettings.Roles.Muted));

		if (role) {
			if (!guildMuteRole || guildMuteRole.id !== role.id) {
				try {
					await msg.guild.settings.update(GuildSettings.Roles.Muted, role);

					// Set up embed message
					roleEmbed.setDescription(stripIndents`
						**Member:** ${msg.author.tag} (${msg.author.id})
						**Action:** Set <@&${role.id}> as the Muted role for the server.
					`);

					return this.sendSuccess(msg, roleEmbed);
				} catch (err) {
					return this.catchError(msg, role, 'set', err);
				}
			} else {
				return msg.sendSimpleError(`Muted role already set to <@&${role.id}>`, 3000);
			}
		} else {
			try {
				await msg.guild.settings.reset(GuildSettings.Roles.Muted);
				// Set up embed message
				roleEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** Removed Muted role.

					_You must include a valid role/roleID when setting the Muted role._
				`);

				return this.sendSuccess(msg, roleEmbed);
			} catch (err) {
				return this.catchError(msg, role, 'reset', err);
			}
		}
	}

	private catchError(msg: KlasaMessage, role: Role, action: string, err: Error): Promise<KlasaMessage | KlasaMessage[]> {
		// Build warning message
		const roleWarn = stripIndents`
			Error occurred in \`mute-role\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display(msg.createdTimestamp)}
			${action === 'set' ? `**Input:** \`Role name: ${role}` : ''}
			**Error Message:** ${err}\n
			`;
		const roleUserWarn = `${action === 'set' ? 'Setting' : 'Resetting'} muted role failed!`;

		// Emit warn event for debugging
		msg.client.emit('warn', roleWarn);

		// Inform the user the command failed
		return msg.sendSimpleError(roleUserWarn);
	}

	private async sendSuccess(msg: KlasaMessage, embed: MessageEmbed): Promise<KlasaMessage | KlasaMessage[]> {
		await modLogMessage(msg, embed);

		// Send the success response
		return msg.sendEmbed(embed);
	}

}
