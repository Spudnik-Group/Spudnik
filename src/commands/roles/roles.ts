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

		let guildAssignableRoles: string[] = await msg.guild.settings.get('roles.selfAssignable') || [];
		let guildDefaultRoleId: string = await msg.guild.settings.get('roles.default');
		let guildMutedRoleId: string = await msg.guild.settings.get('roles.muted');

		if (guildAssignableRoles.length) {
			const rolesListOut: string[] = [];

			guildAssignableRoles.forEach((roleId: string) => {
				const role = msg.guild.roles.filter((r: Role) => r.id === roleId).first();
				if(role) rolesListOut.push(`* <@&${roleId}> - ${role.members.size} members`);
			});

			roleEmbed.fields.push({
				inline: true,
				name: 'Assignable Roles',
				value: `${rolesListOut.sort().join(`
				`)}`
			});
		}

		if (guildDefaultRoleId) {
			const role = msg.guild.roles.filter((r: Role) => r.id === guildDefaultRoleId).first();

			if(role){
				roleEmbed.fields.push({
					inline: true,
					name: 'Default Role',
					value: `<@&${role.id}>`
				});
			}
		}

		if (guildMutedRoleId) {
			const role = msg.guild.roles.filter((r: Role) => r.id === guildMutedRoleId).first();
			
			if(role) {
				roleEmbed.fields.push({
					inline: true,
					name: 'Muted Role',
					value: `<@&${role.id}>`
				});
			}
		}

		if (Array.isArray(roleEmbed.fields) && roleEmbed.fields.length === 0) {
			roleEmbed.setDescription('This guild does not have a default role, muted role, or any self-assignable roles set.');
		}

		// Send the response
		return msg.sendEmbed(roleEmbed);
	}
}
