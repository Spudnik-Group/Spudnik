import { CommandMessage, CommandoGuild } from 'discord.js-commando';
import { TextChannel, MessageEmbed } from 'discord.js';
import { oneLine } from 'common-tags';

/**
 * Get Embed Color.
 *
 * @export
 * @param {CommandMessage} msg
 * @returns number
 */
export function getEmbedColor(msg: CommandMessage): number {
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
 * @param {CommandMessage} msg 
 * @param {CommandoGuild} guild
 * @param {string} outChannelID
 * @param {TextChannel} TextChannel
 * @param {MessageEmbed} embed
 * @returns Promise<Message | Message[]>
 */
export const modLogMessage = (msg: CommandMessage, guild: CommandoGuild, outChannelID: string, outChannel: TextChannel, embed: MessageEmbed) => {
	if (!guild.settings.get('hasSentModLogMessage', false)) {
		msg.reply(oneLine`
			📃 I can keep a log of moderator actions if you create a channel named \'mod-logs\'
			(or some other name configured by the ${
			guild.commandPrefix
			}setmodlogs command) and give me access to it.
			This message will only show up this one time and never again after this so if you desire to set up mod logs make sure to do so now.`);
		guild.settings.set('hasSentModLogMessage', true);
	}

	return outChannelID && guild.settings.get('modlogs', false)
		? outChannel.send('', { embed: embed })
		: null;
};
