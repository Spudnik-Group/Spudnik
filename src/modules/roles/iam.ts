import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';

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
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Used to add a role to yourself.',
			group: 'roles',
			guildOnly: true,
			memberName: 'iam',
			name: 'iam',
			args: [
				{
					default: '',
					key: 'query',
					prompt: 'what role do you want added to yourself?\n',
					type: 'string'
				}
			]
		});
	}

	/**
	 * Run the "iam" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof IAmNotCommand
	 */
	public async run(msg: CommandMessage, args: { query: string }): Promise<Message | Message[]> {
		const roleEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			author: {
				name: 'Role Manager',
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/110/lock_1f512.png'
			}
		});

		const role = msg.guild.roles.find((r) => r.name.toLowerCase() === args.query.toLowerCase());
		const guildAssignableRoles: string[] = msg.client.provider.get(msg.guild, 'assignableRoles', []);

		if (role && guildAssignableRoles) {
			if (!msg.member.roles.keyArray().includes(role.id)) {
				msg.member.roles.add(role.id);

				roleEmbed.description = `Added ${role.name} to your roles.`;

				return msg.embed(roleEmbed);
			} else {
				roleEmbed.description = `You already have the role ${role.name}.`;

				return msg.embed(roleEmbed);
			}
		} else {
			roleEmbed.description = `Cannot find ${args.query} in list of assignable roles.`;

			return msg.embed(roleEmbed);
		}
	}
}
