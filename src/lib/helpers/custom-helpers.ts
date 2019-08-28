
import { TextChannel, MessageEmbed } from 'discord.js';
import { oneLine } from 'common-tags';
import { KlasaMessage } from 'klasa';

/**
 * Get Embed Color.
 *
 * @export
 * @param {KlasaMessage} msg
 * @returns number
 */
export const getEmbedColor = (msg: KlasaMessage): number => {
	let embedColor: number = parseInt(msg.guild.settings.get('embedColor'), 16) || 555555;

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
 * @param {KlasaMessage} msg
 * @param {MessageEmbed} embed
 * @returns Promise<KlasaMessage | KlasaMessage[]>
 */
export const modLogMessage = (msg: KlasaMessage, embed: MessageEmbed): Promise<KlasaMessage | KlasaMessage[]> | null => {
	const guild = msg.guild;
	const outChannelID = guild.settings.get('modlogChannel') || null;
	const outChannel = (msg.guild.channels.get(outChannelID) as TextChannel);

	if (!guild.settings.get('hasSentModLogMessage')) {
		msg.reply(oneLine`
			📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
			(or some other name configured by the ${guild.settings.get('prefix')}modlog command) and give me access to it.
			This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
		guild.settings.update('hasSentModLogMessage', true);
	}

	return outChannelID && guild.settings.get('modlogEnabled')
		? outChannel.sendEmbed(new MessageEmbed(embed))
		: null;
}

/**
 * Delete the calling message for commands, if it's deletable by the bot
 * 
 * @export
 * @param {KlasaMessage} msg
 * @param {CommandoClient} client
 * @returns void
 */
export const deleteCommandMessages = (msg: KlasaMessage): void => {
	if (msg.deletable && msg.guild.settings.get('deleteCommandMessage')) msg.delete();
}
