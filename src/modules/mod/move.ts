import { Channel, GuildMember, Message, MessageEmbed, TextChannel } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor, modLogMessage } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, startTyping, deleteCommandMessages, stopTyping } from '../../lib/helpers';
import { stripIndents } from 'common-tags';

/**
 * Moves messages to different channels.
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
			clientPermissions: ['MANAGE_MESSAGES'],
			description: 'Moves a message to a different channel.',
			details: stripIndents`
				syntax: \`!move <messageId> <#channel> (reason)\`\

				MANAGE_MESSAGES permission required.
			`,
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
			},
			userPermissions: ['MANAGE_MESSAGES']
		});
	}

	/**
	 * Run the "Move" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ messageId: string, channel: Channel, reason: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof MoveCommand
	 */
	public async run(msg: CommandMessage, args: { messageId: string, channel: Channel, reason: string }): Promise<Message | Message[]> {
		const modlogChannel = msg.guild.settings.get('modlogchannel', null);
		const originalChannel = msg.channel as TextChannel;
		const originalMessage: Message = await originalChannel.messages.fetch(args.messageId);
		const originalMessageAuthor: GuildMember = await originalChannel.guild.members.fetch(originalMessage.author.id);

		startTyping(msg);

		if (originalMessage !== undefined) {
			const destinationChannel = args.channel;

			if (destinationChannel && destinationChannel.type === 'text') {
				// Set up embed message
				const moveMessage = new MessageEmbed({
					author: {
						icon_url: `${originalMessageAuthor.user.displayAvatarURL()}`,
						name: `${originalMessageAuthor.displayName}`
					},
					color: getEmbedColor(msg),
					description: `${originalMessage.content}\n`,
					footer: {
						text: `Originally posted at ${originalMessage.createdAt}`
					}
				});
				// Set up embed fields
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

				// Add attachments, if any
				if(originalMessage.attachments.some(attachment => { return attachment.url !== '' })){
					moveMessage.image = { url: originalMessage.attachments.first().url }
				}

				if (originalMessage.embeds.length === 0) {
					// Send the message to the correct channel
					await (destinationChannel as TextChannel).send(moveMessage);
				} else {
					// Build the messages array
					const messages: MessageEmbed[] = new Array();
					messages.push(moveMessage);
					messages.concat(originalMessage.embeds);
					
					// Send the messages to the correct channel
					await (destinationChannel as TextChannel).send(messages);
				}

				// Delete the original message, now that it's been moved
				originalMessage.delete();

				// Log the event in the mod log
				if (msg.guild.settings.get('modlogs', true)) {
					const moveModMessage: MessageEmbed = new MessageEmbed({
						author: {
							icon_url: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/rightwards-arrow-with-hook_21aa.png',
							name: 'Move it!'
						},
						color: getEmbedColor(msg),
						description: stripIndents`
							**Moderator:** ${msg.author.tag} (${msg.author.id})
							**Member:** ${originalMessageAuthor.user.tag} (${originalMessageAuthor.id})
							**Action:** Move
							**Channels:** From- <#${originalChannel.id}> ==> To- <#${destinationChannel.id}
							**Reason:** ${args.reason}
						`
					}).setTimestamp();
					modLogMessage(msg, msg.guild, modlogChannel, msg.guild.channels.get(modlogChannel) as TextChannel, moveModMessage);
				}
				deleteCommandMessages(msg, this.client);
				stopTyping(msg);

			} else {
				stopTyping(msg);
				return sendSimpleEmbeddedError(msg, 'Cannot move a text message to a non-text channel.');
			}

		} else {
			stopTyping(msg);
			return sendSimpleEmbeddedError(msg, `Could not find the message with supplied id (${args.messageId}) in this channel.`);
		}
	}
}
