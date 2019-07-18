import { CommandoMessage } from 'discord.js-commando';
import { TextChannel, MessageEmbed, Message } from 'discord.js';
import { oneLine } from 'common-tags';

/**
 * Get Embed Color.
 *
 * @export
 * @param {CommandoMessage} msg
 * @returns number
 */
export const getEmbedColor = (msg: CommandoMessage): number => {
	let embedColor: number = parseInt(msg.client.provider.get(msg.guild.id, 'embedColor', '555555'), 16);

	// This shouldn't happen, but if it does, return the default embed color
	if (embedColor > parseInt('FFFFFF', 16) || embedColor < 0) {
		embedColor = parseInt('555555', 16);
	}

	return embedColor;
}

/**
 * Log the message to the corresponding guild's mod log channel
 * 
 * @export
 * @param {CommandoMessage} msg
 * @param {MessageEmbed} embed
 * @returns Promise<Message | Message[]>
 */
export const modLogMessage = (msg: CommandoMessage, embed: MessageEmbed): Promise<Message | Message[]> => {
	const guild = msg.guild;
	const outChannelID = msg.guild.settings.get('modlogChannel', null);
	const outChannel = (msg.guild.channels.get(outChannelID) as TextChannel);

	if (!guild.settings.get('hasSentModLogMessage', false)) {
		msg.reply(oneLine`
			📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
			(or some other name configured by the ${guild.commandPrefix}modlog command) and give me access to it.
			This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
		guild.settings.set('hasSentModLogMessage', true);
	}

	return outChannelID && guild.settings.get('modlogEnabled', false)
		? outChannel.send('', { embed: embed })
		: null;
}

/**
 * Delete the calling message for commands, if it's deletable by the bot
 * 
 * @export
 * @param {CommandoMessage} msg
 * @param {CommandoClient} client
 * @returns void
 */
export const deleteCommandMessages = (msg: CommandoMessage): void => {
	if (msg.deletable && msg.guild.settings.get('deleteCommandMessage', false)) msg.delete();
}
