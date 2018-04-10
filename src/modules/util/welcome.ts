import chalk from 'chalk';
import { Message } from 'discord.js';
import { FindOneAndReplaceOption } from 'mongodb';
import { GuildWelcomeMessagesSchema } from '../lib/schemas/guild-welcome-messages-schema';
import { Spudnik } from '../spudnik';

module.exports = (Spudnik: Spudnik) => {
	return {
		commands: [
			'welcome',
		],
		// tslint:disable:object-literal-sort-keys
		welcome: {
			usage: '<text you want to send to a user>',
			description: 'sets the message to be sent to a user when they join your guild; use {guild} for guild name',
			process: (msg: Message, suffix: string) => {
				const guildWelcomeMessagesSet = Spudnik.Database.model('GuildWelcomeMessagesSchema', GuildWelcomeMessagesSchema);

				guildWelcomeMessagesSet.findOneAndUpdate({ guildId: msg.guild.id }, { $set: { welcomeMessage: suffix } }, { upsert: true }, (err: Error, result: any) => {
					if (err) {
						console.log(chalk.red(err.toString()));
						Spudnik.processMessage('Error saving welcome message.', msg, false, false);
					} else {
						if (!result) {
							result = GuildWelcomeMessagesSchema;
							result.welcomeMessage = suffix;
						}

						result.save();

						Spudnik.Config.welcomeMessages[msg.guild.id] = suffix;
						Spudnik.processMessage(`Set welcome message for ${msg.guild.name} to ${suffix}.`, msg, false, false);
					}
				});
			},
		},
	};
};
