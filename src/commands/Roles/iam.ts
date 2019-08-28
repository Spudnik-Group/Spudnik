import { MessageEmbed, Role } from 'discord.js';
import { getEmbedColor, sendSimpleEmbeddedError } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Allows a member to assign a role to themselves.
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
			requiredSettings: ['selfAssignableRoles'],
			description: 'Used to add a self-assignable role to yourself.',
			name: 'iam',
			usage: '<role:Role>'
		});
	}

	/**
	 * Run the "iam" command.
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

		const foundRole = msg.guild.roles.find((r: Role) => r.name.toLowerCase() === role.toLowerCase());
		const guildAssignableRoles: string[] = await msg.guild.settings.get('assignableRoles') || [];

		if (foundRole && guildAssignableRoles.includes(foundRole.id)) {
			if (!msg.member.roles.has(foundRole.id)) {
				msg.member.roles.add(foundRole.id);

				roleEmbed.description = `<@${msg.member.id}>, you now have the ${foundRole.name} role.`;
				
				return msg.sendEmbed(roleEmbed);
			} else {

				return sendSimpleEmbeddedError(msg, `<@${msg.member.id}>, you already have the role ${foundRole.name}.`, 3000);
			}
		} else {

			return sendSimpleEmbeddedError(msg, `Cannot find ${role} in list of assignable roles.`, 3000);
		}
	}
}
