/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, Role, Permissions } from 'discord.js';
import { getEmbedColor, modLogMessage, sendSimpleEmbeddedError } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';

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
			name: 'mute-role',
			permissionLevel: 2,
			requiredPermissions: Permissions.FLAGS['MANAGE_ROLES'],
			usage: '[role:Role]'
		});

		this.customizeResponse('role', 'Please supply a valid role to set as the mute role.');
	}

	/**
	 * Run the "mute-role" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {Role} [role]
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof RoleManagementCommands
	 */
	public async run(msg: KlasaMessage, [role]): Promise<KlasaMessage | KlasaMessage[]> {
		const roleEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/110/lock_1f512.png',
				name: 'Role Manager'
			},
			color: getEmbedColor(msg),
			footer: {
				text: 'Use the `roles` command to list the current default, muted, and self-assignable roles'
			}
		}).setTimestamp();

		const guildMuteRole: string = msg.guild.settings.get(GuildSettings.Roles.Muted);

		if (!role) {
			try {
				await msg.guild.settings.reset(GuildSettings.Roles.Muted);
				// Set up embed message
				roleEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** Removed muted role.
				`);

				return this.sendSuccess(msg, roleEmbed);
			} catch (err) {
				this.catchError(msg, role, 'reset', err);
			}
		} else if (guildMuteRole === role) {
			return sendSimpleEmbeddedError(msg, `Muted role already set to <@${role.id}>`, 3000);
		} else {
			try {
				await msg.guild.settings.update(GuildSettings.Roles.Muted, role);

				// Set up embed message
				roleEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** Set '${role.name}' as the muted role for the server.
				`);

				return this.sendSuccess(msg, roleEmbed);
			} catch (err) {
				this.catchError(msg, role, 'set', err);
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
			**Error Message:** ${action === 'set' ? 'Setting' : 'Resetting'} muted role failed!\n
			`;
		const roleUserWarn = `${action === 'set' ? 'Setting' : 'Resetting'} muted role failed!`;

		// Emit warn event for debugging
		msg.client.emit('warn', roleWarn);

		// Inform the user the command failed
		return sendSimpleEmbeddedError(msg, roleUserWarn);
	}

	private sendSuccess(msg: KlasaMessage, embed: MessageEmbed): Promise<KlasaMessage | KlasaMessage[]> {
		modLogMessage(msg, embed);

		// Send the success response
		return msg.sendEmbed(embed);
	}

}
