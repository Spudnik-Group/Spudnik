import { Schema } from 'mongoose';

export const GuildAntiraidSettingsSchema: Schema = new Schema({
	guildId: String,
	channelId: String,
	seconds: { type: Number, default: 10 },
	limit: { type: Number, default: 4 }
});

