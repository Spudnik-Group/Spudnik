import { GuildMember, Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedMessage, sendSimpleEmbeddedError } from '../../lib/helpers';

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

	/**
	 * Determine if a member has permission to run the "ban" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {boolean}
	 * @memberof BanCommand
	 */
	public hasPermission(msg: CommandMessage): boolean {
		return msg.client.isOwner(msg.author) || msg.member.hasPermission(['BAN_MEMBERS']);
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
		let banEmbed: MessageEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			author: {
				name: 'Ban Hammer',
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/hammer_1f528.png',
			},
			description: '',
		});

		msg.delete();
		if (!memberToBan.bannable || !(msg.member.roles.highest.comparePositionTo(memberToBan.roles.highest) > 0)) {
			return sendSimpleEmbeddedError(msg, `I can't ban ${memberToBan}. Do they have the same or a higher role than me or you?`);
		}
		if (args.daysOfMessages) {
			memberToBan.ban({ days: args.daysOfMessages, reason: args.reason })
				.then(() => {
					banEmbed.description = `Banning ${memberToBan} from ${msg.guild} for ${args.reason}!`;
					return msg.embed(banEmbed);
				})
				.catch((err: Error) => {
					msg.client.emit('error', `Error with command 'ban'\nBanning ${memberToBan} from ${msg.guild} failed!\nError: ${err}`);
					return sendSimpleEmbeddedError(msg, `Banning ${memberToBan} from ${msg.guild} failed!`, 3000);
				});
		} else {
			memberToBan.ban({ reason: args.reason })
				.then(() => {
					banEmbed.description = `Banning ${memberToBan} from ${msg.guild} for ${args.reason}!`;
					return msg.embed(banEmbed);
				})
				.catch((err: Error) => {
					msg.client.emit('error', `Error with command 'ban'\nBanning ${memberToBan} from ${msg.guild} failed!\nError: ${err}`);
					return sendSimpleEmbeddedError(msg, `Banning ${memberToBan} from ${msg.guild} failed!`);
				});
		}

		return sendSimpleEmbeddedMessage(msg, 'Loading...');
	};
}
