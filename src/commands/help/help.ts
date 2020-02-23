/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed, Permissions } from 'discord.js';
import { stripIndents } from 'common-tags';
import { getEmbedColor, getPermissionsFromBitfield, getPermissionsFromLevel, canCommandBeUsed } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Returns helpful information on the bot, or detailed information for a specific command.
 *
 * @export
 * @class HelpCommand
 * @extends {Command}
 */
export default class HelpCommand extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
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
	public async run(msg: KlasaMessage, [command]): Promise<KlasaMessage | KlasaMessage[]> {
		const helpEmbed: MessageEmbed = new MessageEmbed()
			.setColor(getEmbedColor(msg));
		if (command) {
			helpEmbed
				.setTitle(`__Command: **${command.name}**__`)
				.addField('❯ Description', command.description)
				.addField('❯ Usage', command.usage.fullUsage(msg))
				.addField('❯ Details', command.extendedHelp ? (typeof command.extendedHelp === 'function' ? command.extendedHelp() : command.extendedHelp) : 'No extended help details.')
				.addField('❯ Aliases', command.aliases.length > 0 ? command.aliases.join(', ') : 'None', true)
				.addField('❯ Category', `${command.category}`, true)
				.addField('❯ BOT Permissions', command.requiredPermissions.bitfield ? `${getPermissionsFromBitfield(command.requiredPermissions).join('\n')}` : 'No extra perms required', true)
				.addField('❯ User Permission Level', command.permissionLevel ? `${command.permissionLevel}: ${getPermissionsFromLevel(command.permissionLevel)}` : 'No special user perms required', true)
				.addField('❯ Other Details', stripIndents`
					NSFW Only: ${command.nsfw ? '**Yes**' : '**No**'}
					Enabled: ${canCommandBeUsed(msg, command) ? '**Yes**' : '**No**'}
				`, true);

			return msg.sendEmbed(helpEmbed);
		} else {
			helpEmbed
				.setTitle('**Help**')
				.setThumbnail(`${this.client.user.avatarURL()}`)
				.setDescription(stripIndents`
					To get the list of command categories, type \`${msg.guild.settings.get('prefix')}commands\`.
					To get the list of commands in a specific category, type \`${msg.guild.settings.get('prefix')}commands <categoryName>\`.
					To get help with a specific command, type \`${msg.guild.settings.get('prefix')}help <commandName>\`.
				`)
				.addField('❯ Spudnik Command', '[Join](https://spudnik.io/support)', true)
				.addField('❯ Invite to Your Server!', '[Invite](https://spudnik.io/invite)', true)
				.setFooter(`Server Prefix: ${msg.guild.settings.get('prefix')} • Total Commands: ${this.client.commands.size}`);

			return msg.sendEmbed(helpEmbed);
		}
	}
}
