import { CommandMessage } from 'discord.js-commando';

/**
 * Get Embed Color.
 *
 * @export
 * @param {CommandMessage} msg
 * @returns {string}
 */
export function getEmbedColor(msg: CommandMessage): string {
	const embedColor = msg.client.provider.get(msg.guild, 'embedColor', '5592405');
	return embedColor;
}
