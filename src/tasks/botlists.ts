/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Task, Colors } from 'klasa';
import axios from 'axios';
import { SpudConfig } from '@lib//config';

enum ExtraLists {
	LBots = 'lbots.org',
	ListMyBots = 'listmybots.xyz',
	CloudList = 'cloudlist.xyz',
	DiscordbotWorld = 'discordbot.world'
}

export default class extends Task {

	public async run(): Promise<void> {
		if (SpudConfig.debug) return;

		this.client.emit('log', new Colors({ text: 'lightblue' }).format('[BOTLIST UPDATE]'));

		const body = {
			'server_count': this.client.guilds.size,
			'bot_id': this.client.user.id,
			'arcane-center.xyz': SpudConfig.arcanecenterApiKey,
			'botlist.space': SpudConfig.botlistspaceApiKey,
			'bots.ondiscord.xyz': SpudConfig.bodApiKey,
			'botsfordiscord.com': SpudConfig.bfdApiKey,
			'discord.boats': SpudConfig.discordboatsApiKey,
			'discord.bots.gg': SpudConfig.botsggApiKey,
			'discordapps.dev': SpudConfig.discordappsApiKey,
			'discordbotlist.com': SpudConfig.dblApiKey,
			'discordextremelist.xyz': SpudConfig.delApiKey,
			'glennbotlist.xyz': SpudConfig.glennApiKey,
			'mythicalbots.xyz': SpudConfig.mythicalApiKey,
			'top.gg': SpudConfig.topggApiKey,
			'yabl.xyz': SpudConfig.yablApiKey
		};

		try {
			const { data: botBlockResponse } = await axios.post('https://botblock.org/api/count', body, {
				headers: { 'Content-Type': 'application/json' }
			});

			if (botBlockResponse.success) {
				Object.keys(botBlockResponse.success).forEach((key: string) => {
					this.client.emit('log', `Posted statistics successfully to ${key}`);
				});
			}
			if (botBlockResponse.failure) {
				Object.keys(botBlockResponse.failure).forEach((key: string) => {
					this.client.emit('log', `Failed to post statistics to ${key} - ${botBlockResponse.failure[key][1]}`);
				});
			}

			await Promise.all([
				this.query(
					`https://www.cloudlist.xyz/api/stats/${this.client.user.id}`,
					JSON.stringify({ count: this.client.guilds.size }),
					SpudConfig.cloudlistApi,
					ExtraLists.CloudList
				),
				this.query(
					`https://lbots.org/api/v1/bots/${this.client.user.id}/stats`,
					JSON.stringify({ guild_count: this.client.guilds.size }),
					SpudConfig.lbotsApi,
					ExtraLists.LBots
				),
				this.query(
					`https://listmybots.com/api/bot/${this.client.user.id}`,
					JSON.stringify({ count: this.client.guilds.size }),
					SpudConfig.lmbApi,
					ExtraLists.ListMyBots
				),
				this.query(
					`https://discordbot.world/api/bot/${this.client.user.id}/stats`,
					JSON.stringify({ guild_count: this.client.guilds.size }),
					SpudConfig.dbwApi,
					ExtraLists.DiscordbotWorld
				)
			]);
		} catch (err) {
			this.client.emit('log', `Failed to post statistics - ${err}`);
		}

	}

	public async init(): Promise<void> {
		return this.run();
	}

	private async query(url: string, body: string, token: string | null, list: ExtraLists): Promise<any> {
		try {
			if (!token) throw `No token for ${list}`;

			await axios.post(url, body, {
				headers: { 'Content-Type': 'application/json', 'Authorization': token },
				method: 'POST'
			}).then(() => this.client.emit('log', `Posted statistics successfully to ${list}`));

			return list;
		} catch (err) {
			return this.client.emit('log', `Failed to post statistics to ${list} - ${err}`);
		}
	}

}
