/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed, Permissions, Role } from 'discord.js';
import { getEmbedColor, sendSimpleEmbeddedError } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';

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
	public async run(msg: KlasaMessage, [roleName]): Promise<KlasaMessage | KlasaMessage[]> {
		const roleEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/110/lock_1f512.png',
				name: 'Role Manager'
			},
			color: getEmbedColor(msg)
		});

		const role = msg.guild.roles.find((r: Role) => r.name.toLowerCase() === roleName.toLowerCase());
		const guildAssignableRoles = msg.guild.settings.get(GuildSettings.Roles.SelfAssignable);

		if (role && guildAssignableRoles.includes(role.id)) {
			if (!msg.member.roles.has(role.id)) {
				msg.member.roles.add(role.id);

				roleEmbed.description = `<@${msg.member.id}>, you now have the ${role.name} role.`;

				return msg.sendEmbed(roleEmbed);
			}

			return sendSimpleEmbeddedError(msg, `<@${msg.member.id}>, you already have the role ${role.name}.`, 3000);

		}

		return sendSimpleEmbeddedError(msg, `Cannot find ${role} in list of assignable roles.`, 3000);

	}

}
