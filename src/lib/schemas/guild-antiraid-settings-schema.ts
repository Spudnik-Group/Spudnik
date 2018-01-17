import { Schema } from 'mongoose';

export const GuildAntiraidSettingsSchema: Schema = new Schema({
	channelId: String,
	guildId: String,
	limit: { type: Number, default: 4 },
	seconds: { type: Number, default: 10 },
});
