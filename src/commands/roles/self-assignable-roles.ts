/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { getEmbedColor, modLogMessage, sendSimpleEmbeddedError } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';

/**
 * Manage self-assignable roles.
 *
 * @export
 * @class SelfAssignableRoleCommand
 * @extends {Command}
 */
export default class SelfAssignableRolesCommand extends Command {

	constructor(store: CommandStore, file: string[], directory: string) {
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
	public async add(msg: KlasaMessage, [role]): Promise<KlasaMessage | KlasaMessage[]> {
		const roleEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/110/lock_1f512.png',
				name: 'Role Manager'
			},
			color: getEmbedColor(msg),
			footer: {
				text: 'Use the `roles` command to list the current default & assignable roles'
			}
		}).setTimestamp();

		let guildAssignableRoles: string[] = await msg.guild.settings.get(GuildSettings.Roles.SelfAssignable);

		if (!Array.isArray(guildAssignableRoles)) {
			guildAssignableRoles = [];
		}

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

			return sendSimpleEmbeddedError(msg, `${role.name} is already in the list of assignable roles for this guild.`, 3000);
		}
	}

	public async remove(msg: KlasaMessage, [role]): Promise<KlasaMessage | KlasaMessage[]> {
		const roleEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/110/lock_1f512.png',
				name: 'Role Manager'
			},
			color: getEmbedColor(msg),
			footer: {
				text: 'Use the `roles` command to list the current default & assignable roles'
			}
		}).setTimestamp();

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

			return sendSimpleEmbeddedError(msg, `Could not find role with name ${role.name} in the list of assignable roles for this guild.`, 3000);
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

		msg.client.emit('warn', roleWarn);

		// Emit warn event for debugging

		// Inform the user the command failed
		return sendSimpleEmbeddedError(msg, roleUserWarn);
	}

	private sendSuccess(msg: KlasaMessage, embed: MessageEmbed): Promise<KlasaMessage | KlasaMessage[]> {
		modLogMessage(msg, embed);

		// Send the success response
		return msg.sendEmbed(embed);
	}

}
