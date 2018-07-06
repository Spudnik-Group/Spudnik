import { CommandMessage } from 'discord.js-commando';

/**
 * Get Embed Color.
 *
 * @export
 * @param {CommandMessage} msg
 * @returns {number}
 */
export function getEmbedColor(msg: CommandMessage): number {
	let embedColor: number = parseInt(msg.client.provider.get(msg.guild.id, 'embedColor', '555555'), 16);

	// This shouldn't happen, but if it does, return the default embed color
	if (embedColor > parseInt('FFFFFF', 16)) {
		embedColor = parseInt('555555', 16);
	}

	return embedColor;
}
