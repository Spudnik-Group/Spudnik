import { oneLine } from 'common-tags';
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
			aliases: [
				'clean',
				'purge',
				'clear'
			],
			args: [
				{
					key: 'limit',
					max: 100,
					prompt: 'how many messages would you like to delete?\n',
					type: 'integer',
					validate: (limit: number) => {
						if (!isNaN(Number(limit)) && limit > 0) { return true; }
						return 'Invalid number of messages to delete.';
					}
				},
				{
					default: '',
					key: 'filter',
					parse: (str: string) => str.toLowerCase(),
					prompt: 'What filter would you like to apply?\n',
					type: 'string'
				},
				{
					default: '',
					key: 'member',
					prompt: 'UserMention of whose messages would you like to delete?\n',
					type: 'member'
				}
			],
			description: 'Deletes messages.',
			details: oneLine`Deletes messages.\n
				\n
				List of filters:\n
				\`invites\`: Messages containing an invite\n
				\`user <userMention>\`: Messages sent by @user\n
				\`bots\`: Messages sent by bots\n
				\`uploads\`: Messages containing an attachment\n
				\`links\`: Messages containing a link`,
			examples: [
				'!prune 50',
				'!prune 15 links',
				'!prune 50 user @user'
			],
			group: 'mod',
			guildOnly: true,
			memberName: 'prune',
			name: 'prune',
			throttling: {
				duration: 3,
				usages: 2
			}
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
		return msg.member.hasPermission('MANAGE_MESSAGES');
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
		await msg.delete();
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
				return sendSimpleEmbeddedError(msg,
					oneLine`${msg.author}, that is not a valid filter.\n
						\`help prune\` for all available filters.`
				);
			}

			const messages: Collection<string, Message> = await msg.channel.messages.fetch({ limit: limit });
			const messagesToDelete: Collection<string, Message> = messages.filter(messageFilter);

			await sendSimpleEmbeddedMessage(msg, `Pruning ${limit} messages.`).then((response: Message | Message[]) => {
				msg.channel.bulkDelete(messagesToDelete.array().reverse())
					.then(() => { if (response instanceof Message) { response.delete(); } })
					.catch((err: Error) => null);
			});

			return sendSimpleEmbeddedMessage(msg, `Pruned ${limit} messages`, 5000);
		}

		const messages: Collection<string, Message> = await msg.channel.messages.fetch({ limit: limit });
		await sendSimpleEmbeddedMessage(msg, `Pruning ${limit} messages.`)
			.then((response: Message | Message[]) => {
				msg.channel.bulkDelete(messages.array().reverse())
					.then(() => { if (response instanceof Message) { response.delete(); } })
					.catch((err: Error) => null);
			});

		return sendSimpleEmbeddedMessage(msg, `Pruned ${limit} messages`, 5000);
	}
}
