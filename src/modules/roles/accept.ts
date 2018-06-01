import { oneLine } from 'common-tags';
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
			args: [
				{
					default: '',
					key: 'channel',
					prompt: 'Please provide a channel to allow the Terms of Service command to be used in.',
					type: 'channel'
				}
			],
			description: oneLine`
				Accept the guild rules, and be auto-assigned the default role.\n
				Sets the channel to listen for the accept command.\n
				`,
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
			}
		});
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
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/ballot-box-with-check_2611.png',
				name: 'Accept'
			},
			color: getEmbedColor(msg)
		});

		if (args.channel instanceof Channel) {
			if (msg.member.hasPermission('MANAGE_ROLES')) {
				return msg.client.provider.set(msg.guild, 'tosChannel', args.channel.id).then(() => {
					acceptEmbed.description = `Accept channel set to <#${args.channel.id}>.`;

					msg.delete();

					return msg.embed(acceptEmbed);
				}).catch((context) => {
					msg.client.emit('error', `Unsuccessful setting of accept command channel.\nCommand: 'accept'\nContext: ${context}`);
					sendSimpleEmbeddedError(msg, 'Failed to set accept channel.', 5000);

					return msg.delete();
				});
			} else {
				acceptEmbed.description = 'You do not have permission to run this command.';

				msg.delete();

				return msg.embed(acceptEmbed);
			}
		} else if (args.channel === '') {
			const acceptRole: string = msg.client.provider.get(msg.guild, 'defaultRole');
			const role: Role | undefined = msg.guild.roles.get(acceptRole);
			const acceptChannel: string = msg.client.provider.get(msg.guild, 'tosChannel');

			if (role && !msg.member.roles.has(acceptRole) && msg.channel.id === acceptChannel) {
				msg.member.roles.add(acceptRole).then((member) => {
					member.send(`The default role of ${role.name} for the guild ${msg.guild.name} has been applied.`);
				}).catch((context) => {
					msg.client.emit('error', `Unsuccessful setting of role.\nCommand: 'accept'\nContext: ${context}`);
					sendSimpleEmbeddedError(msg, 'Failed to assign default role.', 5000);
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
