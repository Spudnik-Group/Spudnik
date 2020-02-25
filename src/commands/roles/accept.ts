/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, Role } from 'discord.js';
import { getEmbedColor, modLogMessage, sendSimpleEmbeddedError } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage, Timestamp } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';


/**
 * Accept the guild rules, and be auto-assigned the default role.
 *
 * @export
 * @class AcceptCommand
 * @extends {Command}
 */
export default class AcceptCommand extends Command {

public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Accept the Terms of Use for the current guild.',
			name: 'accept',
			requiredSettings: ['tos.channel', 'roles.default']
		});
	}

	/**
	 * Run the "accept" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ channel: Channel }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof AcceptCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const acceptEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/ballot-box-with-check_2611.png',
				name: 'Accept'
			},
			color: getEmbedColor(msg)
		}).setTimestamp();

		const defaultRole: string = msg.guild.settings.get(GuildSettings.Roles.Default);
		const role: Role = msg.guild.roles.get(defaultRole);
		const acceptChannel: string = msg.guild.settings.get(GuildSettings.Tos.Channel);


		if (role && msg.channel.id === acceptChannel) {
			try {
				await msg.member.roles.add(role);
			} catch (err) {
				return this.catchError(msg, err);
			}

			// Set up embed message
			acceptEmbed.setDescription(stripIndents`
				**Member:** ${msg.author.tag} (${msg.author.id})
				**Action:** The default role of ${role.name} has been applied.
			`);

			modLogMessage(msg, acceptEmbed);
		}

		return null;
	}

	private catchError(msg: KlasaMessage, err: Error): Promise<KlasaMessage | KlasaMessage[]> {
		// Build warning message
		let acceptWarn = stripIndents`
			Error occurred in \`accept\` command!
			**Server:** ${msg.guild.name} (${msg.guild.id})
			**Author:** ${msg.author.tag} (${msg.author.id})
			**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display(msg.createdTimestamp)}
		`;

		acceptWarn += stripIndents`
			**Error Message:** ${err}`;

		// Emit warn event for debugging
		msg.client.emit('warn', acceptWarn);

		// Inform the user the command failed
		return sendSimpleEmbeddedError(msg, 'An error occured, an admin will need to assign the default role');
	}

}
