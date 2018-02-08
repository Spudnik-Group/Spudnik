import { Message, MessageEmbed, Role } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';

// tslint:disable-next-line:no-var-requires
const { defaultEmbedColor }: { defaultEmbedColor: string } = require('../config/config.json');

export default class RoleManagementCommands extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Used to add or remove a role to yourself, list available roles, and set the default role.',
			details: 'add <roll>|remove <role>|list|default <role>',
			group: 'roles',
			guildOnly: true,
			memberName: 'role',
			name: 'role',
			args: [
				{
					key: 'subCommand',
					prompt: 'add|remove|default\n',
					type: 'string',
				},
				{
					default: '',
					key: 'role',
					prompt: 'what role do you want added to yourself?\n',
					type: 'role',
				},
			],
		});
	}
	public hasPermission(msg: CommandMessage): boolean {
		return this.client.isOwner(msg.author) || msg.member.hasPermission('ADMINISTRATOR');
	}
	public async run(msg: CommandMessage, args: { subCommand: string, role: Role }): Promise<Message | Message[]> {
		const roleEmbed = new MessageEmbed({
			color: defaultEmbedColor,
			author: {
				name: 'Role Manager',
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/110/lock_1f512.png',
			},
		});

		const guildAssignableRoles = msg.client.provider.get(msg.guild, 'assignableRoles', []);
		const guildDefaultRole: string = msg.client.provider.get(msg.guild, 'defaultRole', '');
		switch (args.subCommand.toLowerCase()) {
			case 'add': {
				if (args.role === undefined) {
					roleEmbed.description = 'No role specified!';
					return msg.embed(roleEmbed);
				}
				if (guildAssignableRoles.indexOf(args.role.id) === -1) {
					guildAssignableRoles.push(args.role.id);

					return msg.client.provider.set(msg.guild, 'assignableRoles', { guildAssignableRoles }).then(() => {
						roleEmbed.description = `Added role '${args.role.name}' from the list of assignable roles.`;
						return msg.embed(roleEmbed);
					}).catch(() => {
						roleEmbed.description = 'There was an error processing the request.';
						return msg.embed(roleEmbed);
					});
				} else {
					roleEmbed.description = `Could not find role with name ${args.role.name} in the list of assignable roles for this guild.`;
					return msg.embed(roleEmbed);
				}
			}
			case 'remove': {
				if (args.role === undefined) {
					roleEmbed.description = 'No role specified!';
					return msg.embed(roleEmbed);
				}
				if (guildAssignableRoles.indexOf(args.role.id) !== -1) {
					guildAssignableRoles.splice(args.role.id);

					return msg.client.provider.set(msg.guild, 'assignableRoles', { guildAssignableRoles }).then(() => {
						return msg.client.provider.set(msg.guild, 'assignableRoles', { guildAssignableRoles }).then(() => {
							roleEmbed.description = `Removed role '${args.role.name}' from the list of assignable roles.`;
							return msg.embed(roleEmbed);
						}).catch(() => {
							roleEmbed.description = 'There was an error processing the request.';
							return msg.embed(roleEmbed);
						});
					});
				} else {
					roleEmbed.description = `Could not find role with name ${args.role.name} in the list of assignable roles for this guild.`;
					return msg.embed(roleEmbed);
				}
			}
			case 'list': {
				if (guildAssignableRoles.length > 0) {
					let roles: string[] = [];
					for (const roleId in guildAssignableRoles) {
						const role: Role = msg.guild.roles.find((r) => r.id === roleId);
						if (role) {
							roles.push(role.name);
						}
					}

					roleEmbed.fields.push({
						name: 'Assignable Roles',
						value: roles.join('\n'),
						inline: true,
					});
				}

				if (guildDefaultRole !== '') {
					const role: Role = msg.guild.roles.find((r) => r.id === guildDefaultRole);

					if (role) {
						roleEmbed.fields.push({
							name: 'Default Role',
							value: role.name,
							inline: true,
						});
					}
				}

				if (roleEmbed.fields === []) {
					roleEmbed.description = 'A default role and assignable roles are not set for this guild.';
				}

				return msg.embed(roleEmbed);
			}
			case 'default': {
				if (args.role === undefined) {
					roleEmbed.description = 'No role specified!';
					return msg.embed(roleEmbed);
				}
				return msg.client.provider.set(msg.guild, 'defaultRole', args.role.id).then(() => {
					return msg.client.provider.set(msg.guild, 'assignableRoles', { guildAssignableRoles }).then(() => {
						roleEmbed.description = `Added default role '${args.role.name}'.`;
						return msg.embed(roleEmbed);
					}).catch(() => {
						roleEmbed.description = 'There was an error processing the request.';
						return msg.embed(roleEmbed);
					});
				});
			}
			default: {
				roleEmbed.description = 'Invalid subcommand. Please see `help roles`.';
				return msg.embed(roleEmbed);
			}
		}
	}
}
