import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbededError, sendSimpleEmbededMessage } from '../../lib/helpers';

// tslint:disable-next-line:no-var-requires
const { defaultEmbedColor }: { defaultEmbedColor: string } = require('../config/config.json');

export default class IAmNotCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Used to set the private welcome message for a new user.',
			group: 'mod',
			guildOnly: true,
			memberName: 'welcome',
			name: 'welcome',
			args: [
				{
					key: 'message',
					prompt: 'What message do you want to send the user when they join the guild?\nUse {user} for username and {guild} for guild name',
					type: 'string',
				},
			],
		});
	}
	public hasPermission(msg: CommandMessage): boolean {
		return this.client.isOwner(msg.author) || msg.member.hasPermission('ADMINISTRATOR');
	}
	public async run(msg: CommandMessage, args: { subCommand: string, message: string }): Promise<Message | Message[]> {
		return msg.client.provider.set(msg.guild, 'welcomeMessage', args.message).then(() => {
			return sendSimpleEmbededMessage(msg, `Successfully set welcome message for ${msg.guild.name}.`);
		}).catch(() => {
			return sendSimpleEmbededError(msg, `There was an error processing the request.`);
		});
	}
}
