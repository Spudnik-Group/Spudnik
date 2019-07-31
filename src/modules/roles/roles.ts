import { stripIndents } from 'common-tags';
import { Message, MessageEmbed, Role } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor, deleteCommandMessages } from '../../lib/custom-helpers';
import { startTyping, stopTyping } from '../../lib/helpers';

/**
 * Lists default and self-assignable roles.
 *
 * @export
 * @class RolesCommand
 * @extends {Command}
 */
export default class RolesCommand extends Command {
	/**
	 * Creates an instance of RolesCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof RolesCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
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
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof RolesCommand
	 */
	public async run(msg: CommandoMessage): Promise<Message | Message[]> {
		const roleEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/110/lock_1f512.png',
				name: 'Role Manager'
			},
			color: getEmbedColor(msg),
			footer: {
				text: 'Use the `iam`/`iamnot` commands to manage your roles'
			}
		});
		
		let guildAssignableRoles: string[] = await msg.client.provider.get(msg.guild.id, 'assignableRoles', []);
		let guildDefaultRoles: string[] = await msg.client.provider.get(msg.guild.id, 'defaultRoles', []);
		
		startTyping(msg);

		if (Array.isArray(guildAssignableRoles) && guildAssignableRoles.length > 0) {
			const roles: Role[] = msg.guild.roles.filter((role) => guildAssignableRoles.includes(role.id)).array();

			if (roles.length > 0) {
				const rolesListOut: string[] = [];

				roles.forEach((i: Role) => {
					rolesListOut.push(`* ${i.name} - ${i.members.size} members`);
				});

				roleEmbed.fields.push({
					inline: true,
					name: 'Assignable Roles',
					value: `${rolesListOut.sort().join(`
					`)}`
				});
			}
		}

		if (Array.isArray(guildDefaultRoles) && guildDefaultRoles.length > 0) {
			const roles: Role[] = msg.guild.roles.filter((role) => guildDefaultRoles.includes(role.id)).array();

			if (roles.length > 0) {
				const rolesListOut: string[] = [];

				roles.forEach((i: Role) => {
					rolesListOut.push(`* ${i.name}`);
				});

				roleEmbed.fields.push({
					inline: true,
					name: 'Default Roles',
					value: `${rolesListOut.sort().join(`
					`)}`
				});
			}
		}

		if (Array.isArray(roleEmbed.fields) && roleEmbed.fields.length === 0) {
			roleEmbed.setDescription('This guild does not have a default role or any self-assignable roles set.');
		}

		deleteCommandMessages(msg);
		stopTyping(msg);
		
		// Send the response
		return msg.embed(roleEmbed);
	}
}
