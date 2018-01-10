import { Schema } from 'mongoose';

export const GuildWelcomeMessagesSchema: Schema = new Schema({
	guildId: { type: String, required: true, unique: true },
	welcomeMessage: { type: String, required: true, unique: true }
});
