/**
 * Copyright (c) 2020 Spudnik Group
 */

import { CommandStore, KlasaMessage, Command, Timestamp } from 'klasa';
import { MessageEmbed, Guild } from 'discord.js';
import { stripIndents } from 'common-tags';
import { specialEmbed, specialEmbedTypes } from '@lib/helpers/embed-helpers';

/**
 * Force the bot to leave a guild
 *
 * @export
 * @class LeaveCommand
 * @extends {Command}
 */
export default class LeaveCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Force the bot to leave a guild',
			guarded: true,
			hidden: true,
			permissionLevel: 9, // BOT OWNER
			usage: '<Guild:guild>'
		});
	}

	/**
	 * Run the "LeaveCommand" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param { Guild } guild
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof LeaveCommand
	 */
	public async run(msg: KlasaMessage, [guild]: [Guild]): Promise<KlasaMessage | KlasaMessage[]> {
		const leaveEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.Leave);

		try {
			await guild.leave();

			leaveEmbed.setDescription(stripIndents`
				Guild Left Successfully!
				**Author:** ${msg.author.tag} (${msg.author.id})
				**Server:** ${guild.name} (${guild.id})
			`);
			this.client.emit('botOwnerLog', ['Bot Left A Guild', `Guild: ${guild.name} [${guild.id}]\nAuthor: ${msg.author.tag} (${msg.author.id})`]);

			return msg.sendEmbed(leaveEmbed);
		} catch (err) {
			// Emit warn event for debugging
			msg.client.emit('warn', stripIndents`
				Error occurred in \`blacklist\` command!
				**Server:** ${msg.guild.name} (${msg.guild.id})
				**Author:** ${msg.author.tag} (${msg.author.id})
				**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display(msg.createdTimestamp)}
				**Error Message:** ${err}
			`);

			// Inform the user the command failed
			return msg.sendSimpleError('Blacklisting failed!');
		}
	}

}
