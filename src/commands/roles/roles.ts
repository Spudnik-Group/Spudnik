/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed, Role } from 'discord.js';
import { getEmbedColor } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';

/**
 * Lists default and self-assignable roles.
 *
 * @export
 * @class RolesCommand
 * @extends {Command}
 */
export default class RolesCommand extends Command {
	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Lists default, muted, and self-assignable roles.',
			name: 'roles'
		});
	}

	/**
	 * Run the "roles" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof RolesCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const roleEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/110/lock_1f512.png',
				name: 'Role Manager'
			},
			color: getEmbedColor(msg),
			footer: {
				text: 'Use the `iam`/`iamnot` commands to manage your roles'
			}
		});

		let guildAssignableRoles: string[] = await msg.guild.settings.get(GuildSettings.Roles.SelfAssignable);
		let guildDefaultRole: string = await msg.guild.settings.get(GuildSettings.Roles.Default);
		let guildMutedRole: string = await msg.guild.settings.get(GuildSettings.Roles.Muted);

		if (guildAssignableRoles.length) {
			const rolesListOut: string[] = [];

			guildAssignableRoles.forEach(role => {
				const r: Role = msg.guild.roles.find((r: Role) => r.id === role.toString());
				if(r) rolesListOut.push(`* <@&${r.id}> - ${r.members.size} members`);
			});

			if(rolesListOut.length) {
				roleEmbed.fields.push({
					inline: true,
					name: 'Assignable Roles',
					value: `${rolesListOut.sort().join('\n')}`
				});
			}
		}

		if (guildDefaultRole) {
			roleEmbed.fields.push({
				inline: true,
				name: 'Default Role',
				value: `<@&${guildDefaultRole}>`
			});
		}

		if (guildMutedRole) {
			roleEmbed.fields.push({
				inline: true,
				name: 'Muted Role',
				value: `<@&${guildMutedRole}>`
			});
		}

		if (Array.isArray(roleEmbed.fields) && roleEmbed.fields.length === 0) {
			roleEmbed.setDescription('This guild does not have a default role, muted role, or any self-assignable roles set.');
		}

		// Send the response
		return msg.sendEmbed(roleEmbed);
	}
}
