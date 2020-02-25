/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { sendSimpleEmbeddedError, getEmbedColor } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';

/**
 * List warns for the guild.
 *
 * @export
 * @class ListWarnsCommand
 * @extends {Command}
 */
export default class ListWarnsCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: [
				'list-warn',
				'warn-list',
				'warns'
			],
			description: 'List warns for the guild.',
			name: 'list-warns'
		});
	}

	/**
	 * Run the "list-warns" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ member: GuildMember, reason: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof ListWarnsCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const warnEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/warning-sign_26a0.png',
				name: 'Warnings List'
			},
			color: getEmbedColor(msg),
			description: ''
		});
		const guildWarnings = await msg.guild.settings.get('warnings');

		if (guildWarnings.length) {
			// Warnings present for current guild
			// Build embed
			guildWarnings.forEach(warning => {
				warnEmbed.description += stripIndents`

						<@${warning.id}> (${warning.id}) - ${warning.points} Points
					`;
			});
			warnEmbed.description += '\n\n';

			// Send the success response
			return msg.sendEmbed(warnEmbed);
		}
		// No warnings for current guild
		return sendSimpleEmbeddedError(msg, 'No warnings for current guild', 3000);

	}

}
