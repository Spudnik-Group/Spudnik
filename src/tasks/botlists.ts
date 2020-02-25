/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Task, Colors } from 'klasa';
import axios from 'axios';
import { SpudConfig } from '@lib//config';

enum Lists {
	BotsForDiscord = 'botsfordiscord.com',
	DiscordBotList = 'discordbotlist.com',
	DiscordBotsOrg = 'discordbots.org',
	DiscordBotsGG = 'discord.bots.gg',
	BotsOnDiscord = 'bots.ondiscord.xyz'
}

export default class extends Task {

	public async run() {
		this.client.emit('verbose', new Colors({ text: 'lightblue' }).format('[BOTLIST UPDATE]'));

		const guilds = this.client.guilds.size.toString();
		const users = this.client.guilds.reduce((acc, val) => acc + val.memberCount, 0).toString();

		await Promise.all([
			this.query(`https://discordbots.org/api/bots/${this.client.user!.id}/stats`,
				`{"server_count":${guilds}}`, SpudConfig.dbApiKey, Lists.DiscordBotsOrg),
			this.query(`https://discord.bots.gg/api/v1/bots/${this.client.user!.id}/stats`,
				`{"guildCount":${guilds}}`, SpudConfig.botsggApiKey, Lists.DiscordBotsGG),
			this.query(`https://botsfordiscord.com/api/bot/${this.client.user!.id}`,
				`{"server_count":${guilds}}`, SpudConfig.bfdApiKey, Lists.BotsForDiscord),
			this.query(`https://discordbotlist.com/api/bots/${this.client.user!.id}/stats`,
				`{"guilds":${guilds},"users":${users}}`, SpudConfig.dblApiKey ? `Bot ${SpudConfig.dblApiKey}` : null, Lists.DiscordBotList),
			this.query(`https://bots.ondiscord.xyz/bot-api/bots/${this.client.user!.id}/guilds`,
				`{"guildCount":${guilds}}`, SpudConfig.bodApiKey, Lists.BotsOnDiscord)
		]);
	}

	public async init() {
		return this.run();
	}

	private async query(url: string, body: string, token: string | null, list: Lists) {
		try {
			if (!token) throw new Error(`No token for ${list}`);

			await axios.post(url, body, {
				headers: { 'Content-Type': 'application/json', 'Authorization': token },
				method: 'POST'
			}).then(() => this.client.emit('verbose', `Posted statistics successfully to ${list}`));

			return list;
		} catch (err) {
			return this.client.emit('warn', `Failed to post statistics to ${list} - ${err}`);
		}
	}

}
