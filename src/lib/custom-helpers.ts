import { CommandMessage } from 'discord.js-commando';

/**
 * Get Embed Color.
 *
 * @export
 * @param {CommandMessage} msg
 * @returns {number}
 */
export function getEmbedColor(msg: CommandMessage): number {
	let embedColor: number = parseInt(msg.client.provider.get(msg.guild, 'embedColor', '555555'), 16);

	if (embedColor > 16777215) {
		embedColor = parseInt('555555', 16);
	}

	return embedColor;
}
