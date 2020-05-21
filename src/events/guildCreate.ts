/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Event } from 'klasa';
import { ClientSettings } from '@lib/types/settings/ClientSettings';

export default class extends Event {

	public run(guild: any): void {
		if (!guild.available) return;
		if (this.client.settings.get(ClientSettings.Blacklist.Guilds).includes(guild.id)) {
			guild.leave();
			this.client.emit('botOwnerLog', ['Blacklisted Guild Tried Adding The Bot', `Guild: ${guild.name} [${guild.id}]`]);
		}
	}

}
