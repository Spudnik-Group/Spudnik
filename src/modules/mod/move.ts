import { stripIndents } from 'common-tags';
import { Channel, Message, TextChannel } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedError } from '../../lib/helpers';

/**
 * Enable or disable the adblock feature.
 *
 * @export
 * @class MoveCommand
 * @extends {Command}
 */
export default class MoveCommand extends Command {
	/**
	 * Creates an instance of MoveCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof MoveCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'messageId',
					prompt: 'Message ID?',
					type: 'string'
				},
				{
					key: 'channel',
					prompt: 'Channel reference?',
					type: 'channel|integer'
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
	 * @memberof MoveCommand
	 */
	public hasPermission(msg: CommandMessage): boolean {
		return msg.member.hasPermission('MANAGE_MESSAGES');
	}

	/**
	 * Run the "warn" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof MoveCommand
	 */
	public async run(msg: CommandMessage, args: { messageId: string, channel: Channel, reason: string }): Promise<Message | Message[]> {
		const originalChannel = msg.channel as TextChannel;
		const originalMessage: Message = await originalChannel.messages.fetch(args.messageId);

		msg.delete();

		if (originalMessage !== undefined) {
			const destinationChannel = args.channel;

			if (destinationChannel && destinationChannel.type === 'text') {
				if (args.reason) {
					(destinationChannel as TextChannel).send(stripIndents`
						Originally posted by <@${originalMessage.author.id}>, in <#${originalChannel.id}> at ${originalMessage.createdAt}
						Moved for: ${args.reason}

						${originalMessage.content}`
					);
				} else {
					(destinationChannel as TextChannel).send(stripIndents`
						Originally posted by <@${originalMessage.author.id}>, in <#${originalChannel.id}> at ${originalMessage.createdAt}:

						${originalMessage.content}`
					);
				}

				return originalMessage.delete();
			} else {
				return sendSimpleEmbeddedError(msg, 'Cannot move a text message to a non-text channel.');
			}

		} else {
			return sendSimpleEmbeddedError(msg, `Could not find the message with supplied id (${args.messageId}) in this channel.`);
		}
	}
}
