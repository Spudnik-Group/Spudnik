import { Channel, Message, MessageEmbed, Role } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError } from '../../lib/helpers';

/**
 * Accept the guild rules, and be auto-assigned the default role.
 *
 * @export
 * @class AcceptCommand
 * @extends {Command}
 */
export default class AcceptCommand extends Command {
	/**
	 * Creates an instance of AcceptCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof AcceptCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Accept the guild rules, and be auto-assigned the default role.',
			examples: [
				'!accept',
				'!accept #channel_name'
			],
			group: 'roles',
			guildOnly: true,
			memberName: 'accept',
			name: 'accept',
			throttling: {
				duration: 3,
				usages: 2
			},
			args: [
				{
					key: 'channel',
					prompt: 'Please provide a channel to allow the Terms of Service command to be used in.',
					type: 'channel',
					default: ''
				}
			]
		});
	}

	/**
	 * Determine if a member has permission to run the "accept" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {boolean}
	 * @memberof AcceptCommand
	 */
	public hasPermission(msg: CommandMessage): boolean {
		const defaultRoleId: string = msg.client.provider.get(msg.guild, 'defaultRole');
		const tosChannelId: string = msg.client.provider.get(msg.guild, 'tosChannel');

		return defaultRoleId !== undefined && msg.guild.roles.has(defaultRoleId) && tosChannelId !== undefined && tosChannelId === msg.channel.id;
	}

	/**
	 * Run the "accept" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof AcceptCommand
	 */
	public async run(msg: CommandMessage, args: { channel: Channel }): Promise<Message | Message[]> {
		const acceptEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			author: {
				name: 'Accept',
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/ballot-box-with-check_2611.png'
			}
		});

		if (msg.member.hasPermission('MANAGE_ROLES') && args.channel instanceof Channel) {
			return msg.client.provider.set(msg.guild, 'tosChannel', args.channel.id).then(() => {
				acceptEmbed.description = `Accept channel set to <#${args.channel.id}>.`;

				msg.delete();
				return msg.embed(acceptEmbed);
			}).catch(() => {
				acceptEmbed.description = 'There was an error processing the request.';

				msg.delete();
				return msg.embed(acceptEmbed);
			});
		} else if (args.channel === undefined) {
			const acceptRole: string = msg.client.provider.get(msg.guild, 'defaultRole');
			const role: Role | undefined = msg.guild.roles.get(acceptRole);
			if (role && !msg.member.roles.has(acceptRole)) {
				msg.member.roles.add(acceptRole).then((member) => {
					member.send(`The default role of ${role.name} for the guild ${msg.guild.name} has been applied.`);
				}).catch((context) => {
					msg.client.emit('error', `Unsuccessful setting of permission.\nCommand: 'accept'\nContext: ${context}`);
					sendSimpleEmbeddedError(msg, 'Failed to assign default role.', 5000);

					return msg.delete();
				});

				return msg.delete();
			} else {
				return msg.delete();
			}
		} else {
			return msg.delete();
		}
	}
}
