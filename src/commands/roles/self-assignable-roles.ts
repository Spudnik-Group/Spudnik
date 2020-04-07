/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, Role } from 'discord.js';
import { modLogMessage } from '@lib/helpers/custom-helpers';
import { Command, CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { specialEmbed } from '@lib/helpers/embed-helpers';

/**
 * Manage self-assignable roles.
 *
 * @export
 * @class SelfAssignableRoleCommand
 * @extends {Command}
 */
export default class SelfAssignableRolesCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: [
				'sar'
			],
			description: 'Used to configure the self-assignable roles feature.',
			name: 'self-assignable-roles',
			permissionLevel: 2,
			subcommands: true,
			usage: '<add|remove> <role:Role>'
		});
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
		const roleEmbed = specialEmbed(msg, 'role-manager');

		let guildAssignableRoles: string[] = await msg.guild.settings.get(GuildSettings.Roles.SelfAssignable);

		if (!Array.isArray(guildAssignableRoles)) {
			guildAssignableRoles = [];
		}

		// eslint-disable-next-line no-negated-condition
		if (!guildAssignableRoles.includes(role.id)) {
			msg.guild.settings.update('roles.selfAssignable', role)
				.then(() => {
					// Set up embed message
					roleEmbed.setDescription(stripIndents`
						**Member:** ${msg.author.tag} (${msg.author.id})
						**Action:** Added role <@&${role.id}> to the list of assignable roles.
					`);

					return this.sendSuccess(msg, roleEmbed);
				})
				.catch((err: Error) => this.catchError(msg, { subCommand: 'add', role }, err));
		} else {
			return msg.sendSimpleError(`${role.name} is already in the list of assignable roles for this guild.`, 3000);
		}
	}

	public async remove(msg: KlasaMessage, [role]: [Role]): Promise<KlasaMessage | KlasaMessage[]> {
		const roleEmbed = specialEmbed(msg, 'role-manager');

		let guildAssignableRoles: string[] = await msg.guild.settings.get(GuildSettings.Roles.SelfAssignable);

		if (!Array.isArray(guildAssignableRoles)) {
			guildAssignableRoles = [];
		}

		if (guildAssignableRoles.includes(role.id)) {
			msg.guild.settings.update(GuildSettings.Roles.SelfAssignable, role)
				.then(() => {
					// Set up embed message
					roleEmbed.setDescription(stripIndents`
						**Member:** ${msg.author.tag} (${msg.author.id})
						**Action:** Removed role <@&${role.id}> from the list of assignable roles.
					`);

					return this.sendSuccess(msg, roleEmbed);
				})
				.catch((err: Error) => this.catchError(msg, { subCommand: 'remove', role }, err));
		} else {
			return msg.sendSimpleError(`Could not find role with name ${role.name} in the list of assignable roles for this guild.`, 3000);
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
