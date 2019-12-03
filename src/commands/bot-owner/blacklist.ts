/**
 * Copyright 2019 - Spudnik Group
 *
 * @summary Add/remove a user/guild to/from the blacklist
 * @author Spudnik Group <comrades@spudnik.io> (https://spudnik.io)
 *
 * Created at     : 2019-08-30 11:40:59 
 * Last modified  : 2019-09-06 11:46:38
 */

import { KlasaClient, CommandStore, KlasaMessage, Command } from "klasa";
import { User } from "discord.js";

/**
 * Add/remove a user/guild to/from the blacklist
 *
 * @export
 * @class BlacklistCommand
 * @extends {Command}
 */
export default class BlacklistCommand extends Command {
	terms = ['usersAdded', 'usersRemoved', 'guildsAdded', 'guildsRemoved'];

	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: (language: any) => language.get('COMMAND_BLACKLIST_DESCRIPTION'),
			hidden: true,
			guarded: true,
			permissionLevel: 10, // BOT OWNER
			usage: '<User:user|Guild:guild|guild:string> [...]'
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
	async run(message: KlasaMessage, [...usersAndGuilds]) {
		const changes: any[][] = [[], [], [], []];
		const queries: any[][] = [[], []];

		for (const userOrGuild of new Set(usersAndGuilds)) {
			const type = userOrGuild instanceof User ? 'user' : 'guild';
			if (this.client.settings[`${type}Blacklist`].includes(userOrGuild.id || userOrGuild)) {
				changes[this.terms.indexOf(`${type}sRemoved`)].push(userOrGuild.name || userOrGuild.username || userOrGuild);
			} else {
				changes[this.terms.indexOf(`${type}sAdded`)].push(userOrGuild.name || userOrGuild.username || userOrGuild);
			}
			queries[Number(type === 'guild')].push(userOrGuild.id || userOrGuild);
		}

		const { errors } = await this.client.settings.update([['userBlacklist', queries[0]], ['guildBlacklist', queries[1]]]);
		if (errors.length) throw String(errors[0]);

		return message.sendLocale('COMMAND_BLACKLIST_SUCCESS', changes);
	}
};
