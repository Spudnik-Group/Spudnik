import { Message, MessageEmbed, Role } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';

// tslint:disable-next-line:no-var-requires
const { defaultEmbedColor }: { defaultEmbedColor: string } = require('../config/config.json');

export default class IAmNotCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Used to add a role to yourself.',
			details: 'add <roll>|remove <role>|default <role>',
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
		switch (args.subCommand.toLowerCase()) {
			case 'add':
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
			case 'remove':
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
			case 'default':
				return msg.client.provider.set(msg.guild, 'defaultRole', args.role.id).then(() => {
					return msg.client.provider.set(msg.guild, 'assignableRoles', { guildAssignableRoles }).then(() => {
						roleEmbed.description = `Added default role '${args.role.name}'.`;
						return msg.embed(roleEmbed);
					}).catch(() => {
						roleEmbed.description = 'There was an error processing the request.';
						return msg.embed(roleEmbed);
					});
				});
			default:
				roleEmbed.description = 'Invalid subcommand. Please see `help roles`.';
				return msg.embed(roleEmbed);
		}
	}
}
