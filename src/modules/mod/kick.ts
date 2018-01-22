import { Collection, GuildMember, Message, MessageMentions, PartialGuild, User } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { resolveMention, sendSimpleEmbeddedError, sendSimpleEmbeddedSuccess, sendSimpleEmbededMessage } from '../../lib/helpers';

export default class KickCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Kicks the user.',
			details: '<user> [reason]',
			group: 'mod',
			guildOnly: true,
			memberName: 'kick',
			name: 'kick',
			throttling: {
				duration: 3,
				usages: 2,
			},
		});
	}

	public hasPermission(msg: CommandMessage): boolean {
		return this.client.isOwner(msg.author) || msg.member.hasPermission('KICK_MEMBERS');
	}

	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		const cmdTxt = msg.content.split(' ')[0].substring(1).toLowerCase();
		const suffix = msg.content.substring(cmdTxt.length + 2);
		const items = suffix.split(' ');

		if (items.length > 0 && items[0]) {
			const mentions = msg.mentions as MessageMentions;
			const member = mentions.members.first();

			if (member !== undefined) {
				if (!member.kickable) {
					return sendSimpleEmbededMessage(msg, `I can't kick ${member}. Do they have the same or a higher role than me?`);
				}
				if (items.length > 1) {
					const reason = items.slice(1).join(' ');
					member.kick(reason).then(() => {
						return sendSimpleEmbededMessage(msg, `Kicking ${member} from ${msg.guild} for ${reason}!`);
					}).catch(() => sendSimpleEmbededMessage(msg, `Kicking ${member} failed!`));
				} else {
					member.kick().then(() => {
						return sendSimpleEmbededMessage(msg, `Kicking ${member} from ${msg.guild}!`);
					}).catch(() => {
						return sendSimpleEmbededMessage(msg, `Kicking ${member} failed!`);
					});
				}
			} else {
				return sendSimpleEmbededMessage(msg, `I couldn't find a user ${items[0]}`);
			}
		}
		return sendSimpleEmbededMessage(msg, 'You must specify a user to kick.');
	}
}