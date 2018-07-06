import { stripIndents } from 'common-tags';
import { GuildMember, Message, MessageEmbed, Role } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Ban a member and optionally delete past messages.
 *
 * @export
 * @class BanCommand
 * @extends {Command}
 */
export default class BanCommand extends Command {
	/**
	 * Creates an instance of BanCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof BanCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'member',
					prompt: 'Who needs the banhammer?',
					type: 'member'
				},
				{
					key: 'reason',
					prompt: 'Why do you want to ban this noob?',
					type: 'string'
				},
				{
					default: 0,
					key: 'daysOfMessages',
					prompt: 'How many days worth of messages would you like to delete?',
					type: 'integer'
				}
			],
			description: 'Bans the user, optionally deleting messages from them in the last x days.',
			details: stripIndents`
				syntax: \`!ban <@userMention> <reason> (daysOfMessages)\`

				Ban Members permission required.
			`,
			examples: [
				'!ban @user being a pleb',
				'!ban @user being a pleb 7'
			],
			group: 'mod',
			guildOnly: true,
			memberName: 'ban',
			name: 'ban',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Determine if a member has permission to run the "ban" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {boolean}
	 * @memberof BanCommand
	 */
	public hasPermission(msg: CommandMessage): boolean {
		return msg.member.hasPermission(['BAN_MEMBERS']);
	}

	/**
	 * Run the "ban" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ member: GuildMember, reason: string, daysOfMessages: number }} args
	 * @returns {(Promise<Message | Message[] | any>)}
	 * @memberof BanCommand
	 */
	public async run(msg: CommandMessage, args: { member: GuildMember, reason: string, daysOfMessages: number }): Promise<Message | Message[]> {
		const memberToBan: GuildMember = args.member;
		const banEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/hammer_1f528.png',
				name: 'Ban Hammer'
			},
			color: getEmbedColor(msg),
			description: ''
		});

		const highestRoleOfCallingMember: Role = msg.member.roles.highest;
		const guild = msg.guild;

		await msg.delete();

		if (!memberToBan.bannable || !(highestRoleOfCallingMember.comparePositionTo(memberToBan.roles.highest) > 0)) {
			return sendSimpleEmbeddedError(msg, `I can't ban <@${memberToBan.id}>. Do they have the same or a higher role than me or you?`);
		}

		if (args.daysOfMessages) {
			memberToBan.ban({ days: args.daysOfMessages, reason: args.reason })
				.then(() => {
					banEmbed.description = `Banning <@${memberToBan.id}> from ${guild.name} for ${args.reason}!`;
					return msg.embed(banEmbed);
				})
				.catch((err: Error) => {
					msg.client.emit('error',
						stripIndents`Error with command 'ban'\n
							Banning ${memberToBan.id} from ${msg.guild} failed!\n
							Error: ${err}`
					);

					return sendSimpleEmbeddedError(msg, `Banning <@${memberToBan.id}> from ${guild.name} failed!`, 3000);
				});
		} else {
			memberToBan.ban({ reason: args.reason })
				.then(() => {
					banEmbed.description = `Banning <@${memberToBan.id}> from ${guild.name} for ${args.reason}!`;
					return msg.embed(banEmbed);
				})
				.catch((err: Error) => {
					msg.client.emit('error',
						stripIndents`Error with command 'ban'\n
							Banning ${memberToBan.id} from ${guild.name} failed!\n
							Error: ${err}`
					);

					return sendSimpleEmbeddedError(msg, `Banning <@${memberToBan.id}> from ${guild.name} failed!`);
				});
		}

		return sendSimpleEmbeddedMessage(msg, 'Loading...');
	}
}
