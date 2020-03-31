/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, Role, Permissions } from 'discord.js';
import { Command, CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { specialEmbed } from '@lib/helpers/embed-helpers';
import { modLogMessage } from '@lib/helpers/custom-helpers';

/**
 * Manage setting a default role.
 *
 * @export
 * @class DefaultRoleCommand
 * @extends {Command}
 */
export default class DefaultRoleCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: [
				'dr'
			],
			description: 'Used to configure the default role for the `accept` command.',
			extendedHelp: stripIndents`
				If no role is provided, the default role is cleared.
			`,
			name: 'default-role',
			permissionLevel: 2,
			requiredPermissions: Permissions.FLAGS.MANAGE_ROLES,
			usage: '[role:Role]'
		});

		this.customizeResponse('role', 'Please supply a valid role to set as the default.');
	}

	/**
	 * Run the "role" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ subCommand: string, role: Role }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof RoleManagementCommands
	 */
	public async run(msg: KlasaMessage, [role]): Promise<KlasaMessage | KlasaMessage[]> {
		const roleEmbed = specialEmbed(msg, 'role-manager');

		const guildDefaultRoleId: string = msg.guild.settings.get(GuildSettings.Roles.Default);
		const guildDefaultRole: Role = msg.guild.roles.get(guildDefaultRoleId);

		if (!role) {
			try {
				await msg.guild.settings.reset(GuildSettings.Roles.Default);
				// Set up embed message
				roleEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** Removed default role.
				`);

				return this.sendSuccess(msg, roleEmbed);
			} catch (err) {
				return this.catchError(msg, role, 'reset', err);
			}
		} else if (!guildDefaultRole || guildDefaultRole.id !== role.id) {
			try {
				await msg.guild.settings.update(GuildSettings.Roles.Default, role);

				// Set up embed message
				roleEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** Set <@&${role.id}> as the default role for the server.
				`);

				return this.sendSuccess(msg, roleEmbed);
			} catch (err) {
				return this.catchError(msg, role, 'set', err);
			}
		} else {
			return msg.sendSimpleError(`Default role already set to <@&${role.id}>`, 3000);
		}
	}

	private catchError(msg: KlasaMessage, role: Role, action: string, err: Error): Promise<KlasaMessage | KlasaMessage[]> {
		// Build warning message
		const roleWarn = stripIndents`
			Error occurred in \`role-management\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display(msg.createdTimestamp)}
			${action === 'set' ? `**Input:** \`Role name: ${role}` : ''}
			**Error Message:** ${err}\n
			`;
		const roleUserWarn = `${action === 'set' ? 'Setting' : 'Resetting'} default role failed!`;

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
