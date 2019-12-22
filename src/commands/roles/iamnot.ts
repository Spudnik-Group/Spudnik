import { MessageEmbed } from 'discord.js';
import { getEmbedColor, sendSimpleEmbeddedError } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Allows a member to unassign a role from themselves.
 *
 * @export
 * @class IAmNotCommand
 * @extends {Command}
 */
export default class IAmNotCommand extends Command {
	/**
	 * Creates an instance of IAmNotCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof IAmNotCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			requiredPermissions: ['MANAGE_ROLES'],
			requiredSettings: ['roles.selfAssignableRoles'],
			description: 'Used to remove a self-assignable role from yourself.',
			name: 'iamnot',
			usage: '<role:Role>'
		});
	}

	/**
	 * Run the "iamnot" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof IAmNotCommand
	 */
	public async run(msg: KlasaMessage, [role]): Promise<KlasaMessage | KlasaMessage[]> {
		const roleEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/110/lock_1f512.png',
				name: 'Role Manager'
			},
			color: getEmbedColor(msg)
		});

		const guildAssignableRoles: string[] = await msg.guild.settings.get('assignableRoles') || [];

		if (guildAssignableRoles.includes(role)) {
			if (msg.member.roles.has(role.id)) {
				await msg.member.roles.remove(role.id);

				roleEmbed.description = `<@${msg.member.id}>, you no longer have the ${role.name} role.`;

				return msg.sendEmbed(roleEmbed);
			} else {

				return sendSimpleEmbeddedError(msg, `<@${msg.member.id}>, you do not have the role ${role.name}.`, 3000);
			}
		} else {

			return sendSimpleEmbeddedError(msg, `Cannot find ${role} in list of assignable roles.`, 3000);
		}
	}
}
