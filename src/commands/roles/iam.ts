/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Permissions, Role, MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { specialEmbed, specialEmbedTypes } from '@lib/helpers/embed-helpers';
import { stripIndents } from 'common-tags';
import { modLogMessage } from '@lib/helpers/custom-helpers';
import { SpudnikCommand } from '@lib/structures/SpudnikCommand';

/**
 * Allows a member to assign a role to themselves.
 *
 * @export
 * @class IAmCommand
 * @extends {Command}
 */
export default class IAmCommand extends SpudnikCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Used to add a self-assignable role to yourself.',
			requiredPermissions: Permissions.FLAGS.MANAGE_ROLES,
			requiredSettings: ['roles.selfAssignable'],
			usage: '<roleName:role|roleName:...string>'
		});

		this.customizeResponse('roleName', 'Please supply a valid role from the list of self-assignable roles to add to yourself.\n\nUse `!roles` to see the list of self-assignable roles.');
	}

	/**
	 * Run the "iam" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof IAmCommand
	 */
	public async run(msg: KlasaMessage, [roleName]: [Role|string]): Promise<KlasaMessage | KlasaMessage[]> {
		const roleEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.RoleManager);
		const modlogEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.RoleManager);
		const guildAssignableRoles = msg.guild.settings.get(GuildSettings.Roles.SelfAssignable);
		let role: Role;

		if (typeof roleName === 'string') {
			role = msg.guild.roles.find((r: Role) => r.name.toLowerCase() === roleName.toLowerCase());
		} else {
			role = roleName;
		}

		if (role && guildAssignableRoles.includes(role.id)) {
			if (!msg.member.roles.has(role.id)) {
				await msg.member.roles.add(role.id);

				roleEmbed.setDescription(`<@${msg.member.id}>, you now have the <@&${role.id}> role.`);
				modlogEmbed.setDescription(stripIndents`
					**Member:** ${msg.member.user.tag} (${msg.member.id})
					**Action:** self-added role
					**Role:** ${role.name} (${role.id})
				`);

				await modLogMessage(msg, modlogEmbed);

				return msg.sendEmbed(roleEmbed);
			}

			roleEmbed.setDescription(`<@${msg.member.id}>, you already have the role <@&${role.id}>.`);

			return msg.sendEmbed(roleEmbed);
		}

		roleEmbed.setDescription(`Cannot find ${roleName} in list of assignable roles.\n\nUse \`!roles\` to see the list of self-assignable roles.`);

		return msg.sendEmbed(roleEmbed);
	}

}
