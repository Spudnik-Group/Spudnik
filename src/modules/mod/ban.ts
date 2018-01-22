import { Collection, GuildMember, Message, User, PartialGuild, MessageMentions } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedSuccess, sendSimpleEmbededMessage, resolveMention } from '../../lib/helpers';

export default class BanCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Bans the user, optionally deleting messages from them in the last x days.',
			details: '<user> [reason]',
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
					key: 'messagesToDelete',
					prompt: 'how many days worth of messages would you like to delete?\n',
					type: 'integer',
				},
			],
		});
	}

	public hasPermission(msg: CommandMessage): boolean {
		return this.client.isOwner(msg.author) || msg.member.hasPermission('BAN_MEMBERS');
	}

	public async run(msg: CommandMessage, args: { messagesToDelete: number }): Promise<Message | Message[]> {
		const cmdTxt = msg.content.split(' ')[0].substring(1).toLowerCase();
		const suffix = msg.content.substring(cmdTxt.length + 2);
		const items = suffix.split(' ');
		if (items.length > 0 && items[0]) {
			const mentions = msg.mentions as MessageMentions;
			const memberToBan = mentions.members.first();

			if (memberToBan !== undefined) {
				if (!memberToBan.bannable || msg.member.highestRole.comparePositionTo(memberToBan.highestRole) > 0) {
					return sendSimpleEmbededMessage(msg, `I can't ban ${memberToBan}. Do they have the same or a higher role than me?`);
				}
				if (items.length > 1) {
					if (!isNaN(parseInt(items[1], 10))) {
						if (items.length > 2) {
							const days = items[1];
							const reason = items.slice(2).join(' ');
							msg.guild.ban(memberToBan, { days: parseFloat(days), reason }).then(() => {
								return sendSimpleEmbededMessage(msg, `Banning ${memberToBan} from ${msg.guild} for ${reason}!`);
							}).catch(() => {
								return sendSimpleEmbededMessage(msg, `Banning ${memberToBan} from ${msg.guild} failed!`);
							});
						} else {
							const days = items[1];
							msg.guild.ban(memberToBan, { days: parseFloat(days) }).then(() => {
								return sendSimpleEmbededMessage(msg, `Banning ${memberToBan} from ${msg.guild}!`);
							}).catch(() => {
								return sendSimpleEmbededMessage(msg, `Banning ${memberToBan} from ${msg.guild} failed!`);
							});
						}
					} else {
						const reason = items.slice(1).join(' ');
						msg.guild.ban(memberToBan, { reason }).then(() => {
							return sendSimpleEmbededMessage(msg, `Banning ${memberToBan} from ${msg.guild} for ${reason}!`);
						}).catch(() => {
							return sendSimpleEmbededMessage(msg, `Banning ${memberToBan} from ${msg.guild} failed!`);
						});
					}
				} else {
					msg.guild.ban(memberToBan).then(() => {
						return sendSimpleEmbededMessage(msg, `Banning ${memberToBan} from ${msg.guild}!`);
					}).catch(() => {
						return sendSimpleEmbededMessage(msg, `Banning ${memberToBan} from ${msg.guild} failed!`);
					});
				}
			} else {
				return sendSimpleEmbeddedError(msg, 'You must specify a valid user to ban.');
			}
		}

		return sendSimpleEmbededMessage(msg, 'You must specify a user to ban.');
	}
}
