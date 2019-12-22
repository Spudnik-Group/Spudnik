import { MessageEmbed, Role } from 'discord.js';
import { getEmbedColor } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

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

		let guildAssignableRoles: Role[] = await msg.guild.settings.get('roles.selfAssignableRoles') || [];
		let guildDefaultRole: Role = await msg.guild.settings.get('roles.defaultRole');

		if (guildAssignableRoles.length) {
			const rolesListOut: string[] = [];

			guildAssignableRoles.forEach((role: Role) => {
				rolesListOut.push(`* ${role.name} - ${role.members.size} members`);
			});

			roleEmbed.fields.push({
				inline: true,
				name: 'Assignable Roles',
				value: `${rolesListOut.sort().join(`
				`)}`
			});
		}

		if (guildDefaultRole) {
			roleEmbed.fields.push({
				inline: true,
				name: 'Default Roles',
				value: guildDefaultRole.name
			});
		}

		if (Array.isArray(roleEmbed.fields) && roleEmbed.fields.length === 0) {
			roleEmbed.setDescription('This guild does not have a default role or any self-assignable roles set.');
		}

		// Send the response
		return msg.sendEmbed(roleEmbed);
	}
}
