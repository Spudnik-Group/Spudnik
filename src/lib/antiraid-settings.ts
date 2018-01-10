import { Guild, GuildMember } from 'discord.js';

import { GuildAntiraidSettingsSchema } from './schemas/guild-antiraid-settings-schema'

export class AntiraidSettings {
	public settings: GuildSettings;
	public recentMembers: GuildMember[];
	public kicking: boolean;

	constructor(guild: Guild, settings: GuildSettings) {
		this.settings = settings;
		this.recentMembers = [];
		this.kicking = false;
	}
};

export class GuildSettings {
	public guildId: string;
	public seconds: number;
	public limit: number;
}
