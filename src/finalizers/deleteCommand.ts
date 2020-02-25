/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Finalizer, KlasaMessage } from 'klasa';
import { GuildSettings } from '@lib/types/settings/GuildSettings';

export default class extends Finalizer {

	async run(msg: KlasaMessage) {
		if (msg.guild && msg.guild.settings.get(GuildSettings.Commands.DeleteCommandMessages) && msg.deletable) await msg.delete();
	}

};
