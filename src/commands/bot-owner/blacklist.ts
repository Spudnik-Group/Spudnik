import { KlasaClient, CommandStore, KlasaMessage, Command } from 'klasa';
import { User } from 'discord.js';

/**
 * Add/remove a user/guild to/from the blacklist
 *
 * @export
 * @class BlacklistCommand
 * @extends {Command}
 */
export default class BlacklistCommand extends Command {
	private terms = ['usersAdded', 'usersRemoved', 'guildsAdded', 'guildsRemoved'];

	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: (language: any) => language.get('COMMAND_BLACKLIST_DESCRIPTION'),
			guarded: true,
			hidden: true,
			permissionLevel: 9, // BOT OWNER
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
	public async run(message: KlasaMessage, [...usersAndGuilds]): Promise<KlasaMessage | KlasaMessage[]> {
		const changes: any[][] = [[], [], [], []];
		const queries: any[][] = [[], []];

		for (const userOrGuild of new Set(usersAndGuilds)) {
			const type = userOrGuild instanceof User ? 'user' : 'guild';

			if (this.client.settings.get(`${type}Blacklist`).includes(userOrGuild.id || userOrGuild)) {
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
