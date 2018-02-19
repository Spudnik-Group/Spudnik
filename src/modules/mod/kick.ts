import { GuildMember, Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbededMessage } from '../../lib/helpers';

export default class KickCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Kicks the user.',
			details: '<user> [reason] [daysOfMessages]',
			group: 'mod',
			guildOnly: true,
			memberName: 'kick',
			name: 'kick',
			throttling: {
				duration: 3,
				usages: 2,
			},
			args: [
				{
					key: 'member',
					prompt: 'who needs the boot?\n',
					type: 'member',
				},
				{
					key: 'reason',
					prompt: 'why do you want to kick this noob?\n',
					type: 'string',
				},
			],
		});
	}

	public hasPermission(msg: CommandMessage): boolean {
		return this.client.isOwner(msg.author) || msg.member.hasPermission('KICK_MEMBERS');
	}

	public async run(msg: CommandMessage, args: { member: GuildMember, reason: string }): Promise<Message | Message[] | any> {
		const memberToKick = args.member;

		if (memberToKick !== undefined) {
			if (!memberToKick.kickable || !(msg.member.roles.highest.comparePositionTo(memberToKick.roles.highest) > 0)) {
				return sendSimpleEmbededMessage(msg, `I can't kick ${memberToKick}. Do they have the same or a higher role than me or you?`);
			}
			memberToKick.kick(args.reason).then(() => {
				return sendSimpleEmbededMessage(msg, `Kicking ${memberToKick} from ${msg.guild} for ${args.reason}!`);
			}).catch(() => sendSimpleEmbededMessage(msg, `Kicking ${memberToKick} failed!`));
		} else {
			return sendSimpleEmbededMessage(msg, 'You must specify a valid user to kick.');
		}
	}
}
