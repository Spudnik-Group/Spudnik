import { stripIndents } from 'common-tags';
import { Collection, GuildMember, Message, User, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage, startTyping, stopTyping } from '../../lib/helpers';
import { getEmbedColor, modLogMessage } from '../../lib/custom-helpers';
import * as format from 'date-fns/format';

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
					max: 50,
					prompt: 'How many messages would you like to delete?\n',
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
					type: 'string',
					validate: (filter: string) => {
						const allowedFilters = ['invites', 'user', 'bots', 'uploads', 'links'];
						if (filter === '') return true;
						if (allowedFilters.indexOf(filter) !== -1) return true;
						
						return 'You provided an invalid filter.';
					}
				},
				{
					default: '',
					key: 'member',
					prompt: 'Whose messages would you like to delete?\n',
					type: 'member'
				}
			],
			clientPermissions: ['MANAGE_MESSAGES'],
			description: 'Deletes messages.',
			details: stripIndents`
				syntax: \`!prune <number> (filter) (@userMention)\`

				List of filters:
				\`invites\`: Messages containing an invite
				\`user <userMention>\`: Messages sent by @user
				\`bots\`: Messages sent by bots
				\`uploads\`: Messages containing an attachment
				\`links\`: Messages containing a link\n

				MANAGE_MESSAGES permission required.
			`,
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
			},
			userPermissions: ['MANAGE_MESSAGES']
		});
	}

	/**
	 * Run the "prune" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ limit: number, filter: string, member: GuildMember }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof PruneCommand
	 */
	public async run(msg: CommandoMessage, args: { limit: number, filter: string, member: GuildMember }): Promise<Message | Message[]> {
		await msg.delete();
		const { filter, limit } = args;
		let messageFilter: (message: Message) => boolean;

		startTyping(msg);

		if (filter) {
			switch (filter) {
				case 'invite': {
					messageFilter = (message: Message) => message.content.search(/(discord\.gg\/.+|discordapp\.com\/invite\/.+)/i) !== -1;
					break;
				}
				case 'user': {
					if (args.member) {
						const { member } = args;
						const user: User = member.user;
						messageFilter = (message: Message) => message.author.id === user.id;
					} else {
						stopTyping(msg);
						
						return sendSimpleEmbeddedError(msg, `${msg.author}, you have to mention someone.`, 3000);
					}
					break;
				}
				case 'bots': {
					messageFilter = (message: Message) => message.author.bot;
					break;
				}
				case 'you': {
					messageFilter = (message: Message) => message.author.id === this.client.user.id;
					break;
				}
				case 'upload': {
					messageFilter = (message: Message) => message.attachments.size !== 0;
					break;
				}
				case 'links': {
					messageFilter = (message: Message) => message.content.search(/https?:\/\/[^ \/\.]+\.[^ \/\.]+/) !== -1;
					break;
				}
			}

			const messages: Collection<string, Message> = await msg.channel.messages.fetch({ limit: limit });
			const messagesToDelete: Collection<string, Message> = messages.filter(messageFilter);

			sendSimpleEmbeddedMessage(msg, `Pruning ${limit} messages.`)
				.then((response: Message | Message[]) => {
					if (response instanceof Message) { response.delete(); }
				
					const oldMessage = messagesToDelete.find(msg => {
						return msg.createdAt < new Date(Date.now() - (14 * 24 * 3600 * 1000));
					});
	
					if (oldMessage) {
						return sendSimpleEmbeddedError(msg, "You can't delete messages older than 14 days", 3000);
					} else {
						msg.channel.bulkDelete(messagesToDelete.array().reverse())
							.then(() => {
								// Log the event in the mod log
								const modlogEmbed: MessageEmbed = new MessageEmbed({
									author: {
										iconURL: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/black-scissors_2702.png',
										name: 'Prune'
									},
									color: getEmbedColor(msg),
									description: stripIndents`
										**Moderator:** ${msg.author.tag} (${msg.author.id})
										**Action:** Prune
										**Details:** Deleted ${args.limit} messages from <#${msg.channel.id}>
										**Filter:** ${args.filter}
									`
								}).setTimestamp();
								modLogMessage(msg, modlogEmbed);
								stopTyping(msg);
								
								return sendSimpleEmbeddedMessage(msg, `Pruned ${limit} messages`, 5000);
							})
							.catch((err: Error) => this.catchError(msg, args, err));
					}
				});
		} else {
			const messages: Collection<string, Message> = await msg.channel.messages.fetch({ limit: limit });
			sendSimpleEmbeddedMessage(msg, `Pruning ${limit} messages.`)
				.then((response: Message | Message[]) => {
					if (response instanceof Message) { response.delete(); }
					
					const oldMessage = messages.find(msg => {
						return msg.createdAt < new Date(Date.now() - (14 * 24 * 3600 * 1000));
					});
	
					if (oldMessage) {
						return sendSimpleEmbeddedError(msg, "You can't delete messages older than 14 days", 3000);
					} else {
						msg.channel.bulkDelete(messages.array().reverse())
							.then(() => {
								// Log the event in the mod log
								const modlogEmbed: MessageEmbed = new MessageEmbed({
									author: {
										iconURL: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/black-scissors_2702.png',
										name: 'Prune'
									},
									color: getEmbedColor(msg),
									description: stripIndents`
										**Moderator:** ${msg.author.tag} (${msg.author.id})
										**Action:** Prune
										**Details:** Deleted ${args.limit} messages from <#${msg.channel.id}>
									`
								}).setTimestamp();
								modLogMessage(msg, modlogEmbed);
						
								// Send the success response
								stopTyping(msg);
								
								return sendSimpleEmbeddedMessage(msg, `Pruned ${limit} messages`, 5000);
							})
							.catch((err: Error) => this.catchError(msg, args, err));
					}
				});
		}
	}
	
	private catchError(msg: CommandoMessage, args: { limit: number, filter: string, member: GuildMember }, err: Error) {
		// Emit warn event for debugging
		msg.client.emit('warn', stripIndents`
		Error occurred in \`prune\` command!
		**Server:** ${msg.guild.name} (${msg.guild.id})
		**Author:** ${msg.author.tag} (${msg.author.id})
		**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
		**Input:** \`limit: ${args.limit} | filter: ${args.filter} | member: ${args.member}\`
		**Error Message:** ${err}`);

		// Inform the user the command failed
		stopTyping(msg);
		
		return sendSimpleEmbeddedError(msg, `Pruning ${args.limit} messages failed!`, 3000);
	}
}
