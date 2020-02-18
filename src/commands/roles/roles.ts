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
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Lists default, muted, and self-assignable roles.',
			name: 'roles'
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

		let guildAssignableRoles: Role[] = await msg.guild.settings.get('roles.selfAssignable');
		let guildDefaultRole: Role = await msg.guild.settings.get('roles.default');
		let guildMutedRole: Role = await msg.guild.settings.get('roles.muted');

		if (guildAssignableRoles.length) {
			const rolesListOut: string[] = [];

			guildAssignableRoles.forEach(role => {
				const r: Role = msg.guild.roles.find((r: Role) => r.id === role.toString());
				if(r) rolesListOut.push(`* <@&${r.id}> - ${r.members.size} members`);
			});

			if(rolesListOut.length){
				roleEmbed.fields.push({
					inline: true,
					name: 'Assignable Roles',
					value: `${rolesListOut.sort().join('\n')}`
				});
			}
		}

		if (guildDefaultRole) {
			roleEmbed.fields.push({
				inline: true,
				name: 'Default Role',
				value: `<@&${guildDefaultRole}>`
			});
		}

		if (guildMutedRole) {
			roleEmbed.fields.push({
				inline: true,
				name: 'Muted Role',
				value: `<@&${guildMutedRole}>`
			});
		}

		if (Array.isArray(roleEmbed.fields) && roleEmbed.fields.length === 0) {
			roleEmbed.setDescription('This guild does not have a default role, muted role, or any self-assignable roles set.');
		}

		// Send the response
		return msg.sendEmbed(roleEmbed);
	}
}
