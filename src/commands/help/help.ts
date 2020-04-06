/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed, Permissions } from 'discord.js';
import { stripIndents } from 'common-tags';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';
import { baseEmbed } from '@lib/helpers/embed-helpers';
import { getPermissionsFromBitfield } from '@lib/helpers/base';
import { getPermissionsFromLevel, canCommandBeUsed } from '@lib/helpers/custom-helpers';

/**
 * Returns helpful information on the bot, or detailed information for a specific command.
 *
 * @export
 * @class HelpCommand
 * @extends {Command}
 */
export default class HelpCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Used to return helpful information on the bot, or detailed information for a specified command.',
			guarded: true,
			name: 'help',
			requiredPermissions: Permissions.FLAGS.EMBED_LINKS,
			usage: '[command:cmd]'
		});
	}

	/**
	 * Run the "Help" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ command: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof HelpCommand
	 */
	public async run(msg: KlasaMessage, [command]: [Command]): Promise<KlasaMessage | KlasaMessage[]> {
		const helpEmbed: MessageEmbed = baseEmbed(msg);

		if (command) {
			helpEmbed
				.setTitle(`__Command: **${command.name}**__`)
				.addField('❯ Description', typeof command.description === 'function' ? command.description(msg.language) : command.description)
				.addField('❯ Usage', command.usage.fullUsage(msg))
				.addField('❯ Details', command.extendedHelp ? (typeof command.extendedHelp === 'function' ? command.extendedHelp(msg.language) : command.extendedHelp) : 'No extended help details.')
				.addField('❯ Aliases', command.aliases.length > 0 ? command.aliases.join(', ') : 'None', true)
				.addField('❯ Category', `${command.category}`, true)
				.addField('❯ BOT Permissions', command.requiredPermissions.bitfield ? `${getPermissionsFromBitfield(command.requiredPermissions).join('\n')}` : 'No extra perms required', true)
				.addField('❯ User Permission Level', command.permissionLevel ? `${command.permissionLevel}: ${getPermissionsFromLevel(command.permissionLevel)}` : 'No special user perms required', true)
				.addField('❯ Other Details', stripIndents`
					NSFW Only: ${command.nsfw ? '**Yes**' : '**No**'}
					Enabled: ${canCommandBeUsed(msg, command) ? '**Yes**' : '**No**'}
				`, true);

			return msg.sendEmbed(helpEmbed);
		}
		helpEmbed
			.setTitle('**Help**')
			.setThumbnail(`${this.client.user.avatarURL()}`)
			.setDescription(stripIndents`
					To get the list of command categories, type \`${msg.guild.settings.get(GuildSettings.Prefix)}commands\`.
					To get the list of commands in a specific category, type \`${msg.guild.settings.get(GuildSettings.Prefix)}commands <categoryName>\`.
					To get help with a specific command, type \`${msg.guild.settings.get(GuildSettings.Prefix)}help <commandName>\`.
				`)
			.addField('❯ Spudnik Command', '[Join](https://spudnik.io/support)', true)
			.addField('❯ Invite to Your Server!', '[Invite](https://spudnik.io/invite)', true)
			.setFooter(`Server Prefix: ${msg.guild.settings.get(GuildSettings.Prefix)} • Total Commands: ${this.client.commands.size}`);

		return msg.sendEmbed(helpEmbed);
	}

}
