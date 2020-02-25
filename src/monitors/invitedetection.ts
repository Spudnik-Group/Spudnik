/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Monitor, MonitorStore } from 'klasa';
import { Message, MessageEmbed } from 'discord.js';
import { GuildSettings } from '@lib/types/settings/GuildSettings';

export default class extends Monitor {

	constructor(store: MonitorStore, file: string[], directory: string) {
		super(store, file, directory, {
			enabled: true,
			ignoreOthers: false,
			ignoreSelf: true,
			name: 'invitedetection'
		});
	}

	async run(msg) {
		if (!msg.guild || !msg.guild.settings.get(GuildSettings.AdblockEnabled)) return null;
		if (await msg.hasAtLeastPermissionLevel(6)) return null;
		if (!/(https?:\/\/)?(www\.)?(discord\.(gg|li|me|io)|discordapp\.com\/invite)\/.+/.test(msg.content)) return null;
		await msg.delete()
			.catch(err => this.client.emit('log', err, 'error'));

		const rejectMessage: Message | Message[] = await msg.channel.send({
			embed: new MessageEmbed()
				.setAuthor('🛑 Adblock')
				.setDescription('Only mods may paste invites to other servers!')
		});
		if (rejectMessage instanceof Message) {
			if (rejectMessage.deletable) {
				rejectMessage.delete({ timeout: 3000 });
			}
		}
	}

}
