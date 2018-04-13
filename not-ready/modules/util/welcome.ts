import chalk from 'chalk';
import { Message } from 'discord.js';
import { FindOneAndReplaceOption } from 'mongodb';
import { GuildWelcomeMessagesSchema } from '../lib/schemas/guild-welcome-messages-schema';
import { Spudnik } from '../spudnik';
import { Message, TextChannel } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedError } from '../../lib/helpers';

export default class WelcomeCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'sets the message to be sent to a user when they join your guild; use {guild} for guild name',
			details: '<text you want to send to a user>',
			group: 'util',
			guildOnly: true,
			memberName: 'welcome',
			name: 'welcome',
			throttling: {
				duration: 3,
				usages: 2,
			},
		});
	}

	public async run(msg: CommandMessage): Promise<Message | Message[]> {
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
		return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?');
	}
}
