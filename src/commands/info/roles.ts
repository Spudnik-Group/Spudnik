/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed, Role } from 'discord.js';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { specialEmbed, specialEmbedTypes } from '@lib/helpers/embed-helpers';

/**
 * Lists default and self-assignable roles.
 *
 * @export
 * @class RolesCommand
 * @extends {Command}
 */
export default class RolesCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Lists default and self-assignable roles.'
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
		const roleEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.RoleManager);
		const guildAssignableRoles: string[] = msg.guild.settings.get(GuildSettings.Roles.SelfAssignable);
		const guildDefaultRole: string = msg.guild.settings.get(GuildSettings.Tos.Role);

		if (guildAssignableRoles.length) {
			const rolesListOut: string[] = [];

			guildAssignableRoles.forEach((role: string) => {
				const r: Role = msg.guild.roles.find((r: Role) => r.id === role.toString());
				if (r) rolesListOut.push(`* <@&${r.id}> - ${r.members.size} members`);
			});

			if (rolesListOut.length) {
				roleEmbed.addField('Assignable Roles', `${rolesListOut.sort().join('\n')}`, true);
			}
		}

		if (guildDefaultRole) {
			roleEmbed.addField('Default (TOS) Role', `<@&${guildDefaultRole}>`, true);
		}

		if (Array.isArray(roleEmbed.fields) && roleEmbed.fields.length === 0) {
			roleEmbed.setDescription('This guild does not have a default role or any self-assignable roles set.');
		}

		// Send the response
		return msg.sendEmbed(roleEmbed);
	}

}
