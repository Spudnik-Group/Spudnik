/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Permissions, Role, MessageEmbed } from 'discord.js';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { specialEmbed } from '@lib/helpers/embed-helpers';

/**
 * Allows a member to unassign a role from themselves.
 *
 * @export
 * @class IAmNotCommand
 * @extends {Command}
 */
export default class IAmNotCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Used to remove a self-assignable role from yourself.',
			name: 'iamnot',
			requiredPermissions: Permissions.FLAGS.MANAGE_ROLES,
			requiredSettings: ['roles.selfAssignable'],
			usage: '<roleName:role|roleName:...string>'
		});

		this.customizeResponse('roleName', 'Please supply a valid role from the list of self-assignable roles to add to yourself.\n\nUse `!roles` to see the list of self-assignable roles.');
	}

	/**
	 * Run the "iamnot" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof IAmNotCommand
	 */
	public async run(msg: KlasaMessage, [roleName]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		const roleEmbed: MessageEmbed = specialEmbed(msg, 'role-manager');
		const guildAssignableRoles = msg.guild.settings.get(GuildSettings.Roles.SelfAssignable);
		let role: Role;

		if (typeof roleName === 'string') {
			role = msg.guild.roles.find((r: Role) => r.name.toLowerCase() === roleName.toLowerCase());
		} else {
			role = roleName;
		}

		if (role && guildAssignableRoles.includes(role.id)) {
			if (msg.member.roles.has(role.id)) {
				await msg.member.roles.remove(role.id);

				roleEmbed.setDescription(`<@${msg.member.id}>, you no longer have the ${role.name} role.`);

				return msg.sendEmbed(roleEmbed);
			}

			return msg.sendSimpleError(`<@${msg.member.id}>, you do not have the role ${role.name}.`, 3000);

		}

		return msg.sendSimpleError(`Cannot find ${roleName} in list of assignable roles.\n\nUse \`!roles\` to see the list of self-assignable roles.`, 5000);

	}

}
