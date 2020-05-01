/**
 * Copyright (c) 2020 Spudnik Group
 */

import { CommandStore, KlasaMessage, Command, Timestamp } from 'klasa';
import { User } from 'discord.js';
import { ClientSettings } from '@lib/types/settings/ClientSettings';
import { stripIndents } from 'common-tags';

/**
 * Add/remove a user/guild to/from the blacklist
 *
 * @export
 * @class BlacklistCommand
 * @extends {Command}
 */
export default class BlacklistCommand extends Command {

	private terms: string[] = ['usersAdded', 'usersRemoved', 'guildsAdded', 'guildsRemoved'];

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: (language: any) => language.get('COMMAND_BLACKLIST_DESCRIPTION'),
			guarded: true,
			hidden: true,
			permissionLevel: 9, // BOT OWNER
			usage: '<User:user|Guild:guild|GuildID:string{17,18}> [...]'
		});
	}

	/**
	 * Run the "BlacklistCommand" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param { any[] } usersAndGuilds
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof BlacklistCommand
	 */
	public async run(msg: KlasaMessage, [...usersAndGuilds]: any[]): Promise<KlasaMessage | KlasaMessage[]> {
		const changes: any[][] = [[], [], [], []];
		const queries: any[][] = [[], []];

		try {
			for (const userOrGuild of new Set(usersAndGuilds)) {
				const type = userOrGuild instanceof User ? 'user' : 'guild';

				if (type === 'user') {
					const userBlacklist = this.client.settings.get(ClientSettings.Blacklist.Users);

					if (userBlacklist.includes(userOrGuild.id || userOrGuild)) {
						changes[this.terms.indexOf(`usersRemoved`)].push(userOrGuild.name || userOrGuild.username || userOrGuild);
					} else {
						changes[this.terms.indexOf(`usersAdded`)].push(userOrGuild.name || userOrGuild.username || userOrGuild);
					}
					queries[0].push(userOrGuild.id || userOrGuild);
				} else {
					const guildBlacklist = this.client.settings.get(ClientSettings.Blacklist.Guilds);

					if (guildBlacklist.includes(userOrGuild.id || userOrGuild)) {
						changes[this.terms.indexOf(`guildsRemoved`)].push(userOrGuild.name || userOrGuild.username || userOrGuild);
					} else {
						changes[this.terms.indexOf(`guildsAdded`)].push(userOrGuild.name || userOrGuild.username || userOrGuild);
					}
					queries[1].push(userOrGuild.id || userOrGuild);
				}
			}

			await this.client.settings.update([[ClientSettings.Blacklist.Users, queries[0]], [ClientSettings.Blacklist.Guilds, queries[1]]]);

			return msg.sendLocale('COMMAND_BLACKLIST_SUCCESS', changes);
		} catch (err) {
			// Emit warn event for debugging
			msg.client.emit('warn', stripIndents`
				Error occurred in \`blacklist\` command!
				**Server:** ${msg.guild.name} (${msg.guild.id})
				**Author:** ${msg.author.tag} (${msg.author.id})
				**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display(msg.createdTimestamp)}
				**Input:** \`${queries}\`
				**Error Message:** ${err}
			`);

			// Inform the user the command failed
			return msg.sendSimpleError('Blacklisting failed!');
		}
	}

}
