/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, KlasaMessage } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { MessageEmbed } from 'discord.js';
import { specialEmbed, specialEmbedTypes } from '@lib/helpers/embed-helpers';
import { stripIndents } from 'common-tags';
import { modLogMessage } from '@lib/helpers/custom-helpers';

/**
 * Sets/Shows the terms of service for a guild.
 *
 * @export
 * @class TermsOfServiceCommand
 * @extends {Command}
 */
export default class AcceptCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Used to accept the Terms of Service for a guild (applies default role).',
			subcommands: true,
			requiredSettings: ['tos.role']
		});
	}

	/**
     * Run the "accept" command.
     *
     * @param {KlasaMessage} msg
     * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
     * @memberof AcceptCommand
     */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const modlogEmbed: MessageEmbed = specialEmbed(msg, specialEmbedTypes.RoleManager);

		try {
			const role = msg.guild.settings.get(GuildSettings.Tos.Role);

			modlogEmbed.setDescription(stripIndents`
				**Member:** ${msg.member.user.tag} (${msg.member.id})
				**Action:** accepted TOS
			`);

			await modLogMessage(msg, modlogEmbed);

			await msg.member.roles.add(role);
			await msg.delete();
		} catch (err) {
			return msg.sendSimpleError('There was an error setting your role, contact a moderator to get it set manually.', 3000);
		}
	}

}
