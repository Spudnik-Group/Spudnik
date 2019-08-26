import { KlasaClient, CommandStore, KlasaMessage } from "klasa";

const { Command } = require('klasa');
const { User } = require('discord.js');

export default class extends Command {
	terms = ['usersAdded', 'usersRemoved', 'guildsAdded', 'guildsRemoved'];

	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			permissionLevel: 10,
			description: (language: any) => language.get('COMMAND_BLACKLIST_DESCRIPTION'),
			usage: '<User:user|Guild:guild|guild:str> [...]',
			usageDelim: ' ',
			guarded: true
		});
	}

	async run(message: KlasaMessage, usersAndGuilds: any[]) {
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
