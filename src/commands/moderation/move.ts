/**
 * Copyright (c) 2020 Spudnik Group
 */

import { GuildMember, Message, MessageEmbed, TextChannel, Permissions } from 'discord.js';
import { modLogMessage } from '@lib/helpers/custom-helpers';
import { stripIndents } from 'common-tags';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { baseEmbed, specialEmbed } from '@lib/helpers/embed-helpers';

/**
 * Moves messages to different channels.
 *
 * @export
 * @class MoveCommand
 * @extends {Command}
 */
export default class MoveCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Moves a message to a different channel.',
			name: 'move',
			permissionLevel: 1, // MANAGE_MESSAGES
			requiredPermissions: Permissions.FLAGS.MANAGE_MESSAGES,
			usage: '<message:msg> <channel:channel> [reason:...string]'
		});
	}

	/**
	 * Run the "Move" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ messageId: string, channel: Channel, reason: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof MoveCommand
	 */
	public async run(msg: KlasaMessage, [message, channel, reason]): Promise<KlasaMessage | KlasaMessage[]> {
		const originalChannel = msg.channel as TextChannel;
		const originalMessage: Message = await originalChannel.messages.fetch(message.id);
		const originalMessageAuthor: GuildMember = await originalChannel.guild.members.fetch(originalMessage.author.id);

		if (originalMessage) {
			const destinationChannel = channel;

			if (destinationChannel && destinationChannel.type === 'text') {
				// Set up embed message
				const moveMessage = baseEmbed(msg)
					.setAuthor(
						`${originalMessageAuthor.displayName}`,
						`${originalMessageAuthor.user.displayAvatarURL()}`
					)
					.setDescription(`${originalMessage.content}\n\n`)
					.setTimestamp(originalMessage.createdTimestamp)
					.addField(
						'Originally posted in:',
						`<#${originalChannel.id}>\n`,
						true
					);

				if (reason) {
					moveMessage.addField(
						'Moved for:',
						`${reason}\n`,
						true
					);
				}

				// Add attachments, if any
				if (originalMessage.attachments.some(attachment => attachment.url !== '')) {
					moveMessage.setImage(originalMessage.attachments.first().url);
				}

				if (originalMessage.embeds.length === 0) {
					// Send the message to the correct channel
					await (destinationChannel as TextChannel).send(moveMessage);
				} else {
					// Build the messages array
					const messages: MessageEmbed[] = [];
					messages.push(moveMessage);
					messages.concat(originalMessage.embeds);

					// Send the messages to the correct channel
					await (destinationChannel as TextChannel).send(messages);
				}

				// Delete the original message, now that it's been moved
				await originalMessage.delete();

				// Log the event in the mod log
				const moveModMessage: MessageEmbed = specialEmbed(msg, 'move')
					.setDescription(stripIndents`
						**Moderator:** ${msg.author.tag} (${msg.author.id})
						**Member:** ${originalMessageAuthor.user.tag} (${originalMessageAuthor.id})
						**Action:** Move
						**Channels:** _from_ - <#${originalChannel.id}> > _to_ - <#${destinationChannel.id}>
						**Reason:** ${reason}
					`);

				await modLogMessage(msg, moveModMessage);
			} else {
				return msg.sendSimpleError('Cannot move a text message to a non-text channel.', 3000);
			}
		} else {
			return msg.sendSimpleError(`Could not find the message with supplied id (${message}) in this channel.`, 3000);
		}
	}

}
