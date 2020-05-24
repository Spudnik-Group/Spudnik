/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Event, EventStore } from 'klasa';
import { SpudConfig } from '@lib//config/spud-config';

export default class extends Event {

	public constructor(store: EventStore, file: string[], directory: string) {
		super(store, file, directory, { name: 'GUILD_MEMBER_ADD', emitter: store.client.ws });
	}

	public async run(data: any): Promise<void> {
		const guild = this.client.guilds.get(data.guild_id);
		const member = guild.members.add(data);

		if (SpudConfig.botListGuilds.includes(guild.id)) return; // Guild is on Blacklist, ignore.

		this.client.emit('welcomeMessage', guild, member);
		this.client.emit('defaultRole', guild, member);
	}

}
