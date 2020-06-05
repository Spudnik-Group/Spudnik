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
	public run(msg: KlasaMessage, [command]: [Command]): Promise<KlasaMessage | KlasaMessage[]> {
		const helpEmbed: MessageEmbed = baseEmbed(msg);
		const prefix = msg.guild.settings.get(GuildSettings.Prefix);

		if (command) {
			helpEmbed
				.setTitle(`__Command: **${command.name}**__`)
				.addField('❯ Description', typeof command.description === 'function' ? command.description(msg.language) : command.description)
				.addField('❯ Usage', `${prefix}${command.name} ${command.usage.usageString}`)
				.addField('❯ Details', typeof command.extendedHelp === 'function' ? command.extendedHelp(msg.language) : command.extendedHelp)
				.addField('❯ Aliases', command.aliases.length > 0 ? command.aliases.join(', ') : 'None')
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
					To get the list of command categories, type \`${prefix}commands\`.
					To get the list of commands in a specific category, type \`${prefix}commands <categoryName>\`.
					To get help with a specific command, type \`${prefix}help <commandName>\`.
				`)
			.addField('❯ Spudnik Command', '[Join](https://spudnik.io/support)', true)
			.addField('❯ Invite to Your Server!', '[Invite](https://spudnik.io/invite)', true)
			.setFooter(`Server Prefix: ${prefix} • Total Commands: ${this.client.commands.size}`);

		return msg.sendEmbed(helpEmbed);
	}

}
