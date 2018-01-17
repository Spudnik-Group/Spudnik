import { Schema } from 'mongoose';

export const GuildDefaultRoleSchema: Schema = new Schema({
	guildId: { type: String, required: true, unique: true },
	roleId: { type: String, required: true, unique: true },
});
