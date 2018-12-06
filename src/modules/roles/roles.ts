import { stripIndents } from 'common-tags';
import { Message, MessageEmbed, Role } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';

/**
 * Lists default and self-assignable roles.
 *
 * @export
 * @class RoleCommand
 * @extends {Command}
 */
export default class RoleCommand extends Command {
	/**
	 * Creates an instance of RoleCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof RoleCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [],
			clientPermissions: ['MANAGE_ROLES'],
			description: 'Lists default and self-assignable roles.',
			details: stripIndents`
				syntax: \`!roles\`
			`,
			examples: [
				'!roles'
			],
			group: 'roles',
			guildOnly: true,
			memberName: 'roles',
			name: 'roles'
		});
	}

	/**
	 * Run the "roles" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof RoleCommand
	 */
	public async run(msg: CommandMessage, args: {}): Promise<Message | Message[]> {
		const roleEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/110/lock_1f512.png',
				name: 'Role Manager'
			},
			color: getEmbedColor(msg)
		});

		let guildAssignableRoles: string[] = msg.client.provider.get(msg.guild.id, 'assignableRoles', []);
		let guildDefaultRoles: string[] = msg.client.provider.get(msg.guild.id, 'defaultRoles', []);

		if (Array.isArray(guildAssignableRoles) && guildAssignableRoles.length > 0) {
			const roles: string[] = msg.guild.roles.filter((role) => guildAssignableRoles.includes(role.id)).reduce((list: string[], role: Role) => {
				list.push(role.name);
				return list;
			}, []).sort();

			if (roles.length > 0) {
				roleEmbed.fields.push({
					inline: true,
					name: 'Assignable Roles',
					value: roles.sort((a, b) => {
						return a.localeCompare(b, 'en', { sensitivity: 'base' });
					}).join('\n')
				});
			}
		}

		if (Array.isArray(guildDefaultRoles) && guildDefaultRoles.length > 0) {
			const roles: string[] = msg.guild.roles.filter((role) => guildDefaultRoles.includes(role.id)).reduce((list: string[], role: Role) => {
				list.push(role.name);
				return list;
			}, []).sort();

			if (roles.length > 0) {
				roleEmbed.fields.push({
					inline: true,
					name: 'Default Roles',
					value: roles.sort((a, b) => {
						return a.localeCompare(b, 'en', { sensitivity: 'base' });
					}).join('\n')
				});
			}
		}

		if (Array.isArray(roleEmbed.fields) && roleEmbed.fields.length === 0) {
			roleEmbed.description = 'A default role and assignable roles are not set for this guild.';
		}

		return msg.embed(roleEmbed);
	}
}
