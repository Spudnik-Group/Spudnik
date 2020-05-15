/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Inhibitor, KlasaMessage } from 'klasa';
import { ClientSettings } from '@lib/types/settings/ClientSettings';

export default class extends Inhibitor {

	public run(message: KlasaMessage): boolean {
		return this.client.settings.get(ClientSettings.Blacklist.Guilds).includes(message.guild.id) || this.client.settings.get(ClientSettings.Blacklist.Users).includes(message.author.id);
	}

}
