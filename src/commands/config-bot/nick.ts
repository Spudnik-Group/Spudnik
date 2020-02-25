/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { GuildMember, Permissions } from 'discord.js';
import { sendSimpleEmbeddedMessage } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';

/**
 * Change the bot's nickname on your server, or reset it.
 *
 * @export
 * @class NickCommand
 * @extends {Command}
 */
export default class NickCommand extends Command {

	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Used to change the bot\'s nickname on your server, or reset it.',
			extendedHelp: stripIndents`
				Supplying no nickname resets the nickname to default.
			`,
			name: 'nick',
			permissionLevel: 6, // MANAGE_GUILD
			requiredPermissions: Permissions.FLAGS['MANAGE_NICKNAMES'],
			usage: '[nickName:string]'
		});
	}

	/**
	 * Run the "nick" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {string} nickName
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof NickCommand
	 */
	public async run(msg: KlasaMessage, [nickName]): Promise<KlasaMessage | KlasaMessage[]> {
		if (nickName === '' || nickName === undefined) {
			(msg.guild.me as GuildMember).setNickname('Spudnik', `${msg.author.username} used Spudnik to reset it.`);

			return sendSimpleEmbeddedMessage(msg, 'Bot nickname cleared.');
		} else {
			(msg.guild.me as GuildMember).setNickname(nickName, `${msg.author.username} used Spudnik to set it.`);

			return sendSimpleEmbeddedMessage(msg, 'Bot nickname set.');
		}
	}
}
