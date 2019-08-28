import { Message, MessageEmbed, Role } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor, deleteCommandMessages } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError } from '../../lib/helpers';

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
			args: [
				{
					key: 'query',
					prompt: 'What role do you want added to yourself?\n',
					type: 'string'
				}
			],
			clientPermissions: ['MANAGE_ROLES'],
			description: 'Used to add a self-assignable role to yourself.',
			details: 'syntax: `!iam <role name>`',
			examples: ['!iam Fortnite'],
			group: 'roles',
			guildOnly: true,
			memberName: 'iam',
			name: 'iam'
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
	public async run(msg: KlasaMessage, args: { query: string }): Promise<KlasaMessage | KlasaMessage[]> {
		const roleEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/110/lock_1f512.png',
				name: 'Role Manager'
			},
			color: getEmbedColor(msg)
		});

		const role = msg.guild.roles.find((r: Role) => r.name.toLowerCase() === args.query.toLowerCase());
		const guildAssignableRoles: string[] = await msg.guild.settings.get('assignableRoles', []);

		if (role && guildAssignableRoles.includes(role.id)) {
			if (!msg.member.roles.has(role.id)) {
				msg.member.roles.add(role.id);

				roleEmbed.description = `<@${msg.member.id}>, you now have the ${role.name} role.`;

				deleteCommandMessages(msg);	
				
				return msg.embed(roleEmbed);
			} else {
				deleteCommandMessages(msg);	

				return sendSimpleEmbeddedError(msg, `<@${msg.member.id}>, you already have the role ${role.name}.`, 3000);
			}
		} else {
			deleteCommandMessages(msg);	

			return sendSimpleEmbeddedError(msg, `Cannot find ${args.query} in list of assignable roles.`, 3000);
		}
	}
}