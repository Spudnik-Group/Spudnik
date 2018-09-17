import { stripIndents } from 'common-tags';
import { Channel, GuildMember, Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';
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
		const originalMessageAuthor: GuildMember = await originalChannel.guild.members.fetch(originalMessage.author.id);

		msg.delete();

		if (originalMessage !== undefined) {
			const destinationChannel = args.channel;

			if (originalMessage.embeds.length === 0) {
				if (destinationChannel && destinationChannel.type === 'text') {
					const moveMessage = new MessageEmbed({
						author: {
							icon_url: `${originalMessage.author.displayAvatarURL()}`,
							name: `${originalMessageAuthor.displayName}`
						},
						color: getEmbedColor(msg),
						description: `${originalMessage.content}`,
						footer: {
							text: `Originally posted at ${originalMessage.createdAt}`
						}
					});

					/*
					if (originalMessage.attachments.array().length > 0) {
						moveMessage.attachFiles(originalMessage.attachments.array());
					}
					*/

					const fields: any = [];

					fields.push({
						inline: true,
						name: 'Original post by:',
						value: `<@${originalMessageAuthor.id}> in <#${originalChannel.id}>`
					});

					if (args.reason) {
						fields.push({
							inline: true,
							name: 'Moved for:',
							value: `${args.reason}`
						});
					}

					if (fields !== []) {
						moveMessage.fields = fields;
					}

					(destinationChannel as TextChannel).send(moveMessage);

					return originalMessage.delete();
				} else {
					return sendSimpleEmbeddedError(msg, 'Cannot move a text message to a non-text channel.');
				}
			} else {
				return sendSimpleEmbeddedError(msg, 'Cannot move a message that contains an embed to a different channel.');
			}

		} else {
			return sendSimpleEmbeddedError(msg, `Could not find the message with supplied id (${args.messageId}) in this channel.`);
		}
	}
}
