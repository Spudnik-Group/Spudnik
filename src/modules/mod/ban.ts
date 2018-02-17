import { GuildMember, Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbededError, sendSimpleEmbededMessage } from '../../lib/helpers';

export default class BanCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Bans the user, optionally deleting messages from them in the last x days.',
			details: '<user> [reason] [daysOfMessages]',
			group: 'mod',
			guildOnly: true,
			memberName: 'ban',
			name: 'ban',
			throttling: {
				duration: 3,
				usages: 2,
			},
			args: [
				{
					key: 'member',
					prompt: 'who needs the banhammer?\n',
					type: 'member',
				},
				{
					key: 'reason',
					prompt: 'why do you want to ban this noob?\n',
					type: 'string',
				},
				{
					default: 0,
					key: 'daysOfMessages',
					prompt: 'how many days worth of messages would you like to delete?\n',
					type: 'integer',
				},
			],
		});
	}

	public hasPermission(msg: CommandMessage): boolean {
		return this.client.isOwner(msg.author) || msg.member.hasPermission('BAN_MEMBERS');
	}

	public async run(msg: CommandMessage, args: { member: GuildMember, reason: string, daysOfMessages: number }): Promise<Message | Message[]> {
		const memberToBan = args.member;

		if (memberToBan !== undefined) {
			if (!memberToBan.bannable || msg.member.roles.highest.comparePositionTo(memberToBan.roles.highest) > 0) {
				return sendSimpleEmbededMessage(msg, `I can't ban ${memberToBan}. Do they have the same or a higher role than me?`);
			}
			if (args.daysOfMessages) {
				memberToBan.ban({ days: args.daysOfMessages, reason: args.reason }).then(() => {
					return sendSimpleEmbededMessage(msg, `Banning ${memberToBan} from ${msg.guild} for ${args.reason}!`);
				}).catch(() => {
					return sendSimpleEmbededMessage(msg, `Banning ${memberToBan} from ${msg.guild} failed!`);
				});
			}
			memberToBan.ban({ reason: args.reason }).then(() => {
				return sendSimpleEmbededMessage(msg, `Banning ${memberToBan} from ${msg.guild} for ${args.reason}!`);
			}).catch(() => {
				return sendSimpleEmbededMessage(msg, `Banning ${memberToBan} from ${msg.guild} failed!`);
			});
		}
		return sendSimpleEmbededError(msg, 'You must specify a valid user to ban.');
	}
}
