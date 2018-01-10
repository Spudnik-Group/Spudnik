import { Schema } from 'mongoose';

export const GuildAssignableRolesSchema: Schema = new Schema({
	guildId: { type: String, required: true, unique: true },
	roleIds: [String]
});
