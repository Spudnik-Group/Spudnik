/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Permissions, Role, MessageEmbed } from 'discord.js';
import { CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { specialEmbed, specialEmbedTypes } from '@lib/helpers/embed-helpers';
import { stripIndents } from 'common-tags';
import { modLogMessage } from '@lib/helpers/custom-helpers';
import { SpudnikCommand } from '@lib/structures/SpudnikCommand';

/**
 * Allows a member to unassign a role from themselves.
 *
 * @export
 * @class IAmNotCommand
 * @extends {Command}
 */
export default class IAmNotCommand extends SpudnikCommand {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Used to remove a self-assignable role from yourself.',
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
		const roleEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.RoleManager);
		const modlogEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.RoleManager);
		const guildAssignableRoles = msg.guild.settings.get(GuildSettings.Roles.SelfAssignable);
		let role: Role;

		try {
			if (typeof roleName === 'string') {
				role = msg.guild.roles.find((r: Role) => r.name.toLowerCase() === roleName.toLowerCase());
			} else {
				role = roleName;
			}

			if (role && guildAssignableRoles.includes(role.id)) {
				if (msg.member.roles.has(role.id)) {
					await msg.member.roles.remove(role.id);

					roleEmbed.setDescription(`<@${msg.member.id}>, you no longer have the <@&${role.id}> role.`);
					modlogEmbed.setDescription(stripIndents`
						**Member:** ${msg.member.user.tag} (${msg.member.id})
						**Action:** self-removed role
						**Role:** ${role.name} (${role.id})
					`);

					await modLogMessage(msg, modlogEmbed);

					return msg.sendEmbed(roleEmbed);
				}

				roleEmbed.setDescription(`<@${msg.member.id}>, you do not have the role <@&${role.id}>.`);

				return msg.sendEmbed(roleEmbed);
			}

			roleEmbed.setDescription(`Cannot find ${roleName} in list of assignable roles.\n\nUse \`!roles\` to see the list of self-assignable roles.`);

			return msg.sendEmbed(roleEmbed);
		} catch (err) {
			// Build warning message
			const roleWarn = stripIndents`
				Error occurred in \`iamnot\` command!
				**Server:** ${msg.guild.name} (${msg.guild.id})
				**Author:** ${msg.author.tag} (${msg.author.id})
				**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display(msg.createdTimestamp)}
				**Error Message:** ${err}\n
			`;

			// Emit warn event for debugging
			msg.client.emit('warn', roleWarn);

			// Inform the user the command failed
			return msg.sendSimpleError('Self-removing role from user failed!');
		}
	}

}
