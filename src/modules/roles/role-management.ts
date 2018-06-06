import { stripIndents } from 'common-tags';
import { Message, MessageEmbed, Role } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError } from '../../lib/helpers';

/**
 * Manage roles including self-assigning, listing, and setting a default role.
 *
 * @export
 * @class RoleManagementCommands
 * @extends {Command}
 */
export default class RoleManagementCommands extends Command {
	/**
	 * Creates an instance of RoleManagementCommands.
	 *
	 * @param {CommandoClient} client
	 * @memberof RoleManagementCommands
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'subCommand',
					prompt: 'What sub-command would you like to use?\nOptions are:\n* add\n* remove\n* list\n* default',
					type: 'string'
				},
				{
					default: '',
					key: 'role',
					prompt: 'What role?\n',
					type: 'role'
				}
			],
			description: 'Used to configure the role management feature.',
			details: stripIndents`
				syntax: \`!role <add|remove|list|default> (@roleMention)\`

				\`add <@roleMention>\` - adds the role to the list of self-assignable-roles.
				\`remove <@roleMention>\` - removes the role from the list of self-assignable-roles.
				\`list\` - lists the available self-assignable-roles.
				\`default <@roleMention>\` - sets the default role.

				Manage Roles permission required.
			`,
			examples: [
				'!role add @role_name',
				'!role remove @role_name',
				'!role list',
				'!role default @role_name'
			],
			group: 'roles',
			guildOnly: true,
			memberName: 'role',
			name: 'role'
		});
	}

	/**
	 * Determine if a member has permission to run the "role" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {boolean}
	 * @memberof RoleManagementCommands
	 */
	public hasPermission(msg: CommandMessage): boolean {
		return msg.member.hasPermission('MANAGE_ROLES');
	}

	/**
	 * Run the "role" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ subCommand: string, role: Role }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof RoleManagementCommands
	 */
	public async run(msg: CommandMessage, args: { subCommand: string, role: Role }): Promise<Message | Message[]> {
		const roleEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/110/lock_1f512.png',
				name: 'Role Manager'
			},
			color: getEmbedColor(msg)
		});

		let guildAssignableRoles: string[] = msg.client.provider.get(msg.guild, 'assignableRoles', []);
		const guildDefaultRole: string = msg.client.provider.get(msg.guild, 'defaultRole', '');

		switch (args.subCommand.toLowerCase()) {
			case 'add': {
				if (args.role === undefined) {
					roleEmbed.description = 'No role specified!';
					return msg.embed(roleEmbed);
				}

				if (!Array.isArray(guildAssignableRoles)) {
					guildAssignableRoles = [];
				}

				if (!guildAssignableRoles.includes(args.role.id)) {
					guildAssignableRoles.push(args.role.id);

					return msg.client.provider.set(msg.guild, 'assignableRoles', guildAssignableRoles)
						.then(() => {
							roleEmbed.description = `Added role '${args.role.name}' to the list of assignable roles.`;
							return msg.embed(roleEmbed);
						})
						.catch((err: Error) => {
							msg.client.emit('warn', `Error in command roles:role-add: ${err}`);
							return sendSimpleEmbeddedError(msg, 'There was an error processing the request.', 3000);
						});
				} else {
					return sendSimpleEmbeddedError(msg, `${args.role.name} is already in the list of assignable roles for this guild.`, 3000);
				}
			}
			case 'remove': {
				if (args.role === undefined) {
					roleEmbed.description = 'No role specified!';
					return msg.embed(roleEmbed);
				}

				if (Array.isArray(guildAssignableRoles) && guildAssignableRoles.includes(args.role.id)) {
					guildAssignableRoles = guildAssignableRoles.filter((i: string) => i !== args.role.id);

					return msg.client.provider.set(msg.guild, 'assignableRoles', guildAssignableRoles)
						.then(() => {
							roleEmbed.description = `Removed role '${args.role.name}' from the list of assignable roles.`;
							return msg.embed(roleEmbed);
						})
						.catch((err: Error) => {
							msg.client.emit('warn', `Error in command roles:role-remove: ${err}`);
							return sendSimpleEmbeddedError(msg, 'There was an error processing the request.', 3000);
						});
				} else {
					return sendSimpleEmbeddedError(msg, `Could not find role with name ${args.role.name} in the list of assignable roles for this guild.`, 3000);
				}
			}
			case 'list': {
				if (Array.isArray(guildAssignableRoles) && guildAssignableRoles.length > 0) {
					const roles: string[] = msg.guild.roles.filter((role) => guildAssignableRoles.includes(role.id)).reduce((list: string[], role: Role) => {
						list.push(role.name);
						return list;
					}, []);

					if (roles.length > 0) {
						roleEmbed.fields.push({
							inline: true,
							name: 'Assignable Roles',
							value: roles.join('\n')
						});
					}
				}

				if (guildDefaultRole !== '') {
					const role: Role = msg.guild.roles.find((r) => r.id === guildDefaultRole);

					if (role) {
						roleEmbed.fields.push({
							inline: true,
							name: 'Default Role',
							value: role.name
						});
					}
				}

				if (Array.isArray(roleEmbed.fields) && roleEmbed.fields.length === 0) {
					roleEmbed.description = 'A default role and assignable roles are not set for this guild.';
				}

				return msg.embed(roleEmbed);
			}
			case 'default': {
				if (args.role.name === undefined) {
					return msg.client.provider.set(msg.guild, 'defaultRole', null)
						.then(() => {
							roleEmbed.description = 'Removed default role.';
							return msg.embed(roleEmbed);
						})
						.catch((err: Error) => {
							msg.client.emit('warn', `Error in command roles:role-default: ${err}`);
							return sendSimpleEmbeddedError(msg, 'There was an error processing the request.', 3000);
						});
				}

				return msg.client.provider.set(msg.guild, 'defaultRole', args.role.id)
					.then(() => {
						roleEmbed.description = `Added default role '${args.role.name}'.`;
						return msg.embed(roleEmbed);
					})
					.catch((err: Error) => {
						msg.client.emit('warn', `Error in command roles:role-default: ${err}`);
						return sendSimpleEmbeddedError(msg, 'There was an error processing the request.', 3000);
					});
			}
			default: {
				return sendSimpleEmbeddedError(msg, 'Invalid subcommand. Please see `help roles`.', 3000);
			}
		}
	}
}
