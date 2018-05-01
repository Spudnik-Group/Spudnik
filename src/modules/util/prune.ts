import { Collection, GuildMember, Message, User } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Deletes previous messages.
 *
 * @export
 * @class PruneCommand
 * @extends {Command}
 */
export default class PruneCommand extends Command {
	/**
	 * Creates an instance of PruneCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof PruneCommand
	 */
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
					validate: (limit: number) => {
						if (!isNaN(Number(limit)) && limit > 0) { return true; }
						return 'Invalid number of messages to delete.';
					},
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

	/**
	 * Determine if a member has permission to run the "prune" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {boolean}
	 * @memberof PruneCommand
	 */
	public hasPermission(msg: CommandMessage): boolean {
		return this.client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_MESSAGES');
	}

	/**
	 * Run the "prune" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ limit: number, filter: string, member: GuildMember }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof PruneCommand
	 */
	public async run(msg: CommandMessage, args: { limit: number, filter: string, member: GuildMember }): Promise<Message | Message[]> {
		msg.delete();
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
				return sendSimpleEmbeddedError(msg, `${msg.author}, that is not a valid filter. \`help prune\` for all available filters.`);
			}

			const messages: Collection<string, Message> = await msg.channel.messages.fetch({ limit });
			const messagesToDelete: Collection<string, Message> = messages.filter(messageFilter);
			await sendSimpleEmbeddedMessage(msg, `Pruning ${limit} messages.`).then((response: Message | Message[]) => {
				msg.channel.bulkDelete(messagesToDelete.array().reverse())
					.then(() => { if (response instanceof Message) { response.delete(); } })
					.catch((err: Error) => null);
			});
			return sendSimpleEmbeddedMessage(msg, `Pruned ${limit} messages`, 5000);
		}

		const messages: Collection<string, Message> = await msg.channel.messages.fetch({ limit });
		await sendSimpleEmbeddedMessage(msg, `Pruning ${limit} messages.`).then((response: Message | Message[]) => {
			msg.channel.bulkDelete(messages.array().reverse())
				.then(() => { if (response instanceof Message) { response.delete(); } })
				.catch((err: Error) => null);
		});
		return sendSimpleEmbeddedMessage(msg, `Pruned ${limit} messages`, 5000);
	}
}
