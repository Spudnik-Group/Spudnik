import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

export default class WelcomeCommand extends Command {
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
			return sendSimpleEmbeddedMessage(msg, `Successfully set welcome message for ${msg.guild.name}.`);
		}).catch(() => {
			return sendSimpleEmbeddedError(msg, `There was an error processing the request.`);
		});
	}
}
