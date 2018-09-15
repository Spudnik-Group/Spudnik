import { stripIndents } from 'common-tags';
import { GuildChannel, Message, TextChannel } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedError } from '../../lib/helpers';

/**
 * Enable or disable the adblock feature.
 *
 * @export
 * @class WarnCommand
 * @extends {Command}
 */
export default class WarnCommand extends Command {
	/**
	 * Creates an instance of WarnCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof WarnCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'messageId',
					prompt: 'Message ID?\n',
					type: 'integer'
				},
				{
					key: 'channelRef',
					prompt: 'Channel reference?',
					type: 'channel'
				},
				{
					default: '',
					key: 'reason',
					prompt: 'Reason?',
					type: 'string'
				}
			],
			description: 'Moves a message to a different channel.',
			examples: [
				'!move 1234567890 #channel',
				'!move 1234567890 #channel rule violation'
			],
			group: 'mod',
			guildOnly: true,
			memberName: 'move',
			name: 'move',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Determine if a member has permission to run the "adblock" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {boolean}
	 * @memberof WarnCommand
	 */
	public hasPermission(msg: CommandMessage): boolean {
		return msg.member.hasPermission('MANAGE_MESSAGES');
	}

	/**
	 * Run the "warn" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof WarnCommand
	 */
	public async run(msg: CommandMessage, args: { messageId: string, channel: GuildChannel, reason: string }): Promise<Message | Message[]> {
		const originalMessage: Message = msg.channel.messages.find((msg) => msg.id === args.messageId);

		msg.delete();

		if (originalMessage !== undefined) {
			const originalChannel: TextChannel = originalMessage.channel as TextChannel;
			const destinationChannel: TextChannel = args.channel as TextChannel;

			originalMessage.delete();

			if (args.reason) {
				return destinationChannel.send(stripIndents`
					Originally posted by <@${originalMessage.member.id}>, in <#${originalChannel.id} (${args.reason}):
					${originalMessage.content}`
				);
			} else {
				return destinationChannel.send(stripIndents`
					Originally posted by <@${originalMessage.member.id}>, in <#${originalChannel.id}:
					${originalMessage.content}`
				);
			}

		} else {
			return sendSimpleEmbeddedError(msg, `Could not find the message with supplied id (${args.messageId}) in this channel.`);
		}
	}
}
