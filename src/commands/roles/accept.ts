/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed, Role } from 'discord.js';
import { getEmbedColor, modLogMessage, sendSimpleEmbeddedError } from '../../lib/helpers';
import * as format from 'date-fns/format';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Accept the guild rules, and be auto-assigned the default role.
 *
 * @export
 * @class AcceptCommand
 * @extends {Command}
 */
export default class AcceptCommand extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Accept the Terms of Use for the current guild.',
			name: 'accept',
			requiredSettings: ['tos.channel', 'roles.defaultRole']
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

		const defaultRole: Role = msg.guild.settings.get('roles.defaultRole');
		const acceptChannel: string = msg.guild.settings.get('tos.channel');

		if (defaultRole && msg.channel.id === acceptChannel) {
			try {
				await msg.member.roles.add(defaultRole);
			} catch (err) {
				return this.catchError(msg, err);
			}

			// Set up embed message
			acceptEmbed.setDescription(stripIndents`
				**Member:** ${msg.author.tag} (${msg.author.id})
				**Action:** The default role of ${defaultRole.name} has been applied.
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
			**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
		`;

		acceptWarn += stripIndents`
			**Error Message:** ${err}`;

		// Emit warn event for debugging
		msg.client.emit('warn', acceptWarn);

		// Inform the user the command failed
		return sendSimpleEmbeddedError(msg, 'An error occured, an admin will need to assign the default role');
	}
}
