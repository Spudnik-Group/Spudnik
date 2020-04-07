/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Permissions, Role } from 'discord.js';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { specialEmbed } from '@lib/helpers/embed-helpers';

/**
 * Allows a member to assign a role to themselves.
 *
 * @export
 * @class IAmNotCommand
 * @extends {Command}
 */
export default class IAmNotCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Used to add a self-assignable role to yourself.',
			name: 'iam',
			requiredPermissions: Permissions.FLAGS.MANAGE_ROLES,
			requiredSettings: ['roles.selfAssignable'],
			usage: '<roleName:string>'
		});
	}

	/**
	 * Run the "iam" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof IAmNotCommand
	 */
	public async run(msg: KlasaMessage, [roleName]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		const roleEmbed = specialEmbed(msg, 'role-manager');

		const role = msg.guild.roles.find((r: Role) => r.name.toLowerCase() === roleName.toLowerCase());
		const guildAssignableRoles = msg.guild.settings.get(GuildSettings.Roles.SelfAssignable);

		if (role && guildAssignableRoles.includes(role.id)) {
			if (!msg.member.roles.has(role.id)) {
				await msg.member.roles.add(role.id);

				roleEmbed.setDescription(`<@${msg.member.id}>, you now have the ${role.name} role.`);

				return msg.sendEmbed(roleEmbed);
			}

			return msg.sendSimpleError(`<@${msg.member.id}>, you already have the role ${role.name}.`, 3000);

		}

		return msg.sendSimpleError(`Cannot find ${role} in list of assignable roles.`, 3000);

	}

}
