import { Collection, GuildMember, Message, User, PartialGuild } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedSuccess, sendSimpleEmbededMessage } from '../../lib/helpers';

export default class PruneCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['clean', 'purge', 'clear'],
			description: 'Deletes messages.',
			details: `Deletes messages. Here is a list of filters:
				__invites:__ Messages containing an invite
				__user @user:__ Messages sent by @user
				__bots:__ Messages sent by bots
				__uploads:__ Messages containing an attachment
				__links:__ Messages containing a link`,
			group: 'util',
			guildOnly: true,
			memberName: 'prune',
			name: 'prune',
			throttling: {
				duration: 3,
				usages: 2,
			},
			args: [
				{
					key: 'limit',
					max: 100,
					prompt: 'how many messages would you like to delete?\n',
					type: 'integer',
				},
				{
					default: '',
					key: 'filter',
					parse: (str: string) => str.toLowerCase(),
					prompt: 'what filter would you like to apply?\n',
					type: 'string',
				},
				{
					default: '',
					key: 'member',
					prompt: 'whose messages would you like to delete?\n',
					type: 'member',
				},
			],
		});
	}

	public hasPermission(msg: CommandMessage): boolean {
		return this.client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES');
	}

	public async run(msg: CommandMessage, args: { limit: number, filter: string, member: GuildMember }): Promise<Message | Message[]> {
		const { filter, limit } = args;
		let messageFilter: (message: Message) => boolean;

		if (filter) {
			if (filter === 'invite') {
				messageFilter = (message: Message) => message.content.search(/(discord\.gg\/.+|discordapp\.com\/invite\/.+)/i) !== -1;
			} else if (filter === 'user') {
				if (args.member) {
					const { member } = args;
					const user: User = member.user;
					messageFilter = (message: Message) => message.author.id === user.id;
				} else {
					return sendSimpleEmbeddedError(msg, `${msg.author}, you have to mention someone.`);
				}
			} else if (filter === 'bots') {
				messageFilter = (message: Message) => message.author.bot;
			} else if (filter === 'you') {
				messageFilter = (message: Message) => message.author.id === this.client.user.id;
			} else if (filter === 'upload') {
				messageFilter = (message: Message) => message.attachments.size !== 0;
			} else if (filter === 'links') {
				messageFilter = (message: Message) => message.content.search(/https?:\/\/[^ \/\.]+\.[^ \/\.]+/) !== -1;
			} else {
				return sendSimpleEmbeddedError(msg, `${msg.author}, that is not a valid filter. \`help clean\` for all available filters.`);
			}

			const response = sendSimpleEmbededMessage(msg, `Pruning ${limit} messages.`);
			const messages: Collection<string, Message> = await msg.channel.fetchMessages({ limit });
			const messagesToDelete: Collection<string, Message> = messages.filter(messageFilter);

			msg.channel.bulkDelete(messagesToDelete.array().reverse())
				.then(() => { if (response instanceof Message) { response.delete(); } })
				.catch((err: Error) => null);

			return sendSimpleEmbededMessage(msg, `Pruned ${messagesToDelete.array.length} messages`, 5000);
		}

		const response = sendSimpleEmbededMessage(msg, `Pruning ${limit} messages.`);
		const messages: Collection<string, Message> = await msg.channel.fetchMessages({ limit });

		msg.channel.bulkDelete(messages.array().reverse())
			.then(() => { if (response instanceof Message) { response.delete(); } })
			.catch((err: Error) => null);

		return sendSimpleEmbededMessage(msg, `Pruned ${messages.array.length} messages`, 5000);
	}
}
