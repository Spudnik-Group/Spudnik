import { MessageEmbed, Role } from 'discord.js';
import { getEmbedColor } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';
import { stripIndents } from 'common-tags';

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
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Lists default and self-assignable roles.',
			extendedHelp: stripIndents`
				syntax: \`!roles\`
			`,
			name: 'roles',
		});
	}

	/**
	 * Run the "roles" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof RolesCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
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
		
		let guildAssignableRoles: string[] = await msg.guild.settings.get('assignableRoles') || [];
		let guildDefaultRoles: string[] = await msg.guild.settings.get('defaultRoles') || [];

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
		
		// Send the response
		return msg.sendEmbed(roleEmbed);
	}
}
