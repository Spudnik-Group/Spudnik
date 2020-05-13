/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, Role } from 'discord.js';
import { modLogMessage } from '@lib/helpers/custom-helpers';
import { Command, CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { specialEmbed, specialEmbedTypes } from '@lib/helpers/embed-helpers';

/**
 * Manage self-assignable roles.
 *
 * @export
 * @class SelfAssignableRoleCommand
 * @extends {Command}
 */
export default class SelfAssignableRoleCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['sar', 'self-assignable-role'],
			description: 'Used to configure the self-assignable roles feature.',
			permissionLevel: 2,
			subcommands: true,
			usage: '<add|remove> <role:role>'
		});

		this.customizeResponse('role', 'Please supply a valid role to add/remove from the list of self-assignable roles.');
	}

	/**
	 * Run the "role" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ subCommand: string, role: Role }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof SelfAssignableRolesCommand
	 */
	public async add(msg: KlasaMessage, [role]: [Role]): Promise<KlasaMessage | KlasaMessage[]> {
		const roleEmbed = specialEmbed(msg, specialEmbedTypes.RoleManager);
		const guildAssignableRoles: string[] = msg.guild.settings.get(GuildSettings.Roles.SelfAssignable);

		if (guildAssignableRoles.includes(role.id)) {
			return msg.sendSimpleError(`${role.name} is already in the list of assignable roles for this guild.`, 3000);
		}

		try {
			await msg.guild.settings.update('roles.selfAssignable', role);

			// Set up embed message
			roleEmbed.setDescription(stripIndents`
				**Member:** ${msg.author.tag} (${msg.author.id})
				**Action:** Added role to the list of self-assignable roles
				**Role:** ${role.name} (${role.id})
			`);

			return this.sendSuccess(msg, roleEmbed);
		} catch (err) {
			return this.catchError(msg, { subCommand: 'add', role }, err);
		}
	}

	public async remove(msg: KlasaMessage, [role]: [Role]): Promise<KlasaMessage | KlasaMessage[]> {
		const roleEmbed = specialEmbed(msg, specialEmbedTypes.RoleManager);
		const guildAssignableRoles: string[] = msg.guild.settings.get(GuildSettings.Roles.SelfAssignable);

		if (!guildAssignableRoles.includes(role.id)) {
			return msg.sendSimpleError(`Could not find role with name ${role.name} in the list of assignable roles for this guild.`, 3000);
		}

		try {
			await msg.guild.settings.update(GuildSettings.Roles.SelfAssignable, role);

			// Set up embed message
			roleEmbed.setDescription(stripIndents`
				**Member:** ${msg.author.tag} (${msg.author.id})
				**Action:** Removed role from the list of self-assignable roles
				**Role:** ${role.name} (${role.id})
			`);

			return this.sendSuccess(msg, roleEmbed);
		} catch (err) {
			return this.catchError(msg, { subCommand: 'remove', role }, err);
		}
	}

	private catchError(msg: KlasaMessage, args: any, err: Error): Promise<KlasaMessage | KlasaMessage[]> {
		// Build warning message
		let roleWarn = stripIndents`
			Error occurred in \`self-assignable-roles\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display(msg.createdTimestamp)}
			**Input:** \`Role ${args.subCommand.toLowerCase()}\` | role name: \`${args.role}\`
		`;
		let roleUserWarn = '';

		switch (args.subCommand.toLowerCase()) {
			case 'add': {
				roleUserWarn = 'Adding new self assignable role failed!\n';
				break;
			}
			case 'remove': {
				roleUserWarn = 'Removing self assignable role failed!\n';
				break;
			}
		}

		roleWarn += `**Error Message:** ${err}`;

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
