/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { Collection, Message, Role, Permissions } from 'discord.js';
import { Command, CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { specialEmbed, specialEmbedTypes } from '@lib/helpers/embed-helpers';
import { modLogMessage } from '@lib/helpers/custom-helpers';
import { isNormalInteger } from '@lib/utils/util';

/**
 * Manage guild roles.
 *
 * @export
 * @class RoleCommand
 * @extends {Command}
 */
export default class RoleCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Used to add or remove roles from your server.',
			extendedHelp: stripIndents`
				**Subcommand Usage**:
				\`add "role name" (hexcolor)\` - adds the role to your guild with the supplied color.
				\`remove role name\` - removes the role from your guild.
			`,
			name: 'role',
			permissionLevel: 2, // MANAGE_ROLES
			requiredPermissions: Permissions.FLAGS.MANAGE_ROLES,
			subcommands: true,
			usage: '<add|remove> <name:Role|name:string> (color:hexcolor)'
		});
	}

	/**
	 * Add a new role
	 *
	 * @param {KlasaMessage} msg
	 * @param {[ name: Role | string, color: string ]}
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof RoleManagementCommands
	 */
	public async add(msg: KlasaMessage, [name, color]: [Role|string, string]): Promise<KlasaMessage | KlasaMessage[]> {
		const roleEmbed = specialEmbed(msg, specialEmbedTypes.RoleManager);

		try {
			let roleMetaData = {};

			if (color === '') {
				roleMetaData = {
					data: {
						name
					}
				};
			} else {
				roleMetaData = {
					data: {
						color,
						name
					}
				};
			}

			// TODO: add a reason
			await msg.guild.roles.create(roleMetaData);
		} catch (err) {
			return this.catchError(msg, { subCommand: 'add', name: name.toString(), arg3: color }, err);
		}

		roleEmbed.setDescription(stripIndents`
					**Member:** ${msg.author.tag} (${msg.author.id})
					**Action:** Added role '${name}' to the guild.
				`);

		await modLogMessage(msg, roleEmbed);

		return msg.sendEmbed(roleEmbed);
	}

	/**
	 * Remove a role
	 *
	 * @param {KlasaMessage} msg
	 * @param {[ name: Role | string, color: string ]}
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof RoleManagementCommands
	 */
	public async remove(msg: KlasaMessage, [name]: [Role|string]): Promise<KlasaMessage | KlasaMessage[]> {
		const roleEmbed = specialEmbed(msg, specialEmbedTypes.RoleManager);
		const rolesFound: Collection<string, Role> = msg.guild.roles.filter((role: Role) => role.name.toLocaleLowerCase() === (typeof name === 'string' ? name.toLocaleLowerCase() : name.name));

		if (rolesFound.size > 1) {
			const rolesFoundArray = rolesFound.array();

			roleEmbed.setDescription(stripIndents`
						More than one role was found matching the provided name.
						Which role would you like to delete?\n
						${rolesFoundArray.map((role: Role, i: number) => `**${i + 1}** - \`${role.id}\` - <@&${role.id}> - ${role.members.size} members`).join('\n')}`);

			await msg.sendEmbed(roleEmbed);

			const filter = (res: Message): boolean => (res.author.id === msg.author.id);

			try {
				const responses = await msg.channel.awaitMessages(filter, { max: 1 });
				const response = responses.first();

				if (isNormalInteger(response.content) && ((Number(response.content) > -1) && (Number(response.content) < rolesFoundArray.length))) {
					try {
						await rolesFoundArray[Number(response.content) - 1].delete()
							.then(async (deletedRole: Role) => {
								roleEmbed.setDescription(stripIndents`
												**Member:** ${msg.author.tag} (${msg.author.id})
												**Action:** Removed role \`${deletedRole.name}\` from the guild.
											`);

								await modLogMessage(msg, roleEmbed);

								return msg.sendEmbed(roleEmbed);
							})
							.catch((err: Error) => this.catchError(msg, { subCommand: 'remove', name: name.toString() }, err));

					} catch (err) {
						return this.catchError(msg, { subCommand: 'remove', name: name.toString() }, err);
					}
				} else {
					return msg.sendSimpleError('Please supply a row number corresponding to the role you want to delete.');
				}
			} catch (err) {
				return this.catchError(msg, { subCommand: 'remove', name: name.toString() }, err);
			}
		} else if (rolesFound.size === 1) {
			const roleToDelete = rolesFound.first();

			try {
				// TODO: add a reason
				await roleToDelete.delete()
					.then(async (deletedRole: Role) => {
						roleEmbed.setDescription(stripIndents`
									**Member:** ${msg.author.tag} (${msg.author.id})
									**Action:** Removed role \`${deletedRole.name}\` from the guild.
								`);

						await modLogMessage(msg, roleEmbed);

						return msg.sendEmbed(roleEmbed);
					})
					.catch((err: Error) => this.catchError(msg, { subCommand: 'remove', name: name.toString() }, err));
			} catch (err) {
				return this.catchError(msg, { subCommand: 'remove', name: name.toString() }, err);
			}
		} else {
			return msg.sendSimpleError(`A role with the supplied name \`${name}\` was not found on this guild.`);
		}
	}

	private catchError(msg: KlasaMessage, args: { subCommand: string; name: string; arg3?: string }, err: Error): Promise<KlasaMessage | KlasaMessage[]> {
		// Build warning message
		let roleWarn = stripIndents`
			Error occurred in \`role\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display(msg.createdTimestamp)}
			**Input:** \`Role ${args.subCommand.toLowerCase()}\` | role name: ${args.name} | color/reason: ${args.arg3}`;
		let roleUserWarn = '';

		switch (args.subCommand.toLowerCase()) {
			case 'add': {
				roleUserWarn = 'Adding new role failed!\n';
				break;
			}
			case 'remove': {
				roleUserWarn = 'Removing role failed!\n';
				break;
			}
		}

		roleWarn += `**Error Message:** ${err}`;

		// Emit warn event for debugging
		msg.client.emit('warn', roleWarn);

		// Inform the user the command failed
		return msg.sendSimpleError(roleUserWarn);
	}

}
