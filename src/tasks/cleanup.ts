/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Task, Colors, KlasaClient, TaskStore } from 'klasa';
import { SnowflakeUtil } from 'discord.js';

// THRESHOLD equals to 30 minutes in milliseconds:
//     - 1000 milliseconds = 1 second
//     - 60 seconds        = 1 minute
//     - 30 minutes
const THRESHOLD = 1000 * 60 * 30;

export default class MemorySweeper extends Task {
	private colors;
	private header;

	constructor(client: KlasaClient, store: TaskStore, file: string[], directory: string) {
		super(client, store, file, directory);

		// The colors to stylise the console's logs
		this.colors = {
			green: new Colors({ text: 'green' }),
			red: new Colors({ text: 'lightred' }),
			yellow: new Colors({ text: 'lightyellow' })
		};

		// The header with the console colors
		this.header = new Colors({ text: 'lightblue' }).format('[CACHE CLEANUP]');
	}

	public async run() {
		const OLD_SNOWFLAKE = SnowflakeUtil.generate(Date.now() - THRESHOLD);
		let presences = 0, guildMembers = 0, emojis = 0, users = 0;

		// Per-Guild sweeper
		for (const guild of this.client.guilds.values()) {
			// Clear presences
			presences += guild.presences.size;
			guild.presences.clear();

			// Clear members that haven't send a message in the last 30 minutes
			const { me } = guild;
			for (const [id, member] of guild.members) {
				if (member === me) continue;
				if (member.lastMessageID && member.lastMessageID > OLD_SNOWFLAKE) continue;
				guildMembers++;
				guild.members.delete(id);
			}

			// Clear emojis
			emojis += guild.emojis.size;
			guild.emojis.clear();
		}

		// Per-User sweeper
		for (const user of this.client.users.values()) {
			if (user.lastMessageID && user.lastMessageID > OLD_SNOWFLAKE) continue;
			this.client.users.delete(user.id);
			users++;
		}

		// Emit a log
		this.client.emit('verbose',
			`${this.header} ${
				this.setColor(presences)} [Presence]s | ${
				this.setColor(guildMembers)} [GuildMember]s | ${
				this.setColor(users)} [User]s | ${
				this.setColor(emojis)} [Emoji]s.`);
	}

	/**
	 * Set a colour depending on the amount:
	 * > 1000 : Light Red colour
	 * > 100  : Light Yellow colour
	 * < 100  : Green colour
	 * @since 3.0.0
	 * @param {number} number The number to colourise
	 * @returns {string}
	 */
	private setColor(num: number): string {
		const text = String(num).padStart(5, ' ');
		// Light Red color
		if (num > 1000) return this.colors.red.format(text);
		// Light Yellow color
		if (num > 100) return this.colors.yellow.format(text);
		// Green color
		
		return this.colors.green.format(text);
	}
};
