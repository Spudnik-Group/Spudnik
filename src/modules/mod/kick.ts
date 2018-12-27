import { stripIndents } from 'common-tags';
import { GuildMember, Message, MessageEmbed } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Kick a member from the guild.
 *
 * @export
 * @class KickCommand
 * @extends {Command}
 */
export default class KickCommand extends Command {
	/**
	 * Creates an instance of KickCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof KickCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'member',
					prompt: 'Who needs the boot?\n',
					type: 'member'
				},
				{
					key: 'reason',
					prompt: 'Why do you want to kick this noob?\n',
					type: 'string'
				}
			],
			clientPermissions: ['KICK_MEMBERS'],
			description: 'Kicks a user.',
			details: stripIndents`
				syntax: \`!kick <@userMention> <reason>\`

				KICK_MEMBERS permission required.
			`,
			examples: [
				'!kick @user being a pleb'
			],
			group: 'mod',
			guildOnly: true,
			memberName: 'kick',
			name: 'kick',
			throttling: {
				duration: 3,
				usages: 2
			},
			userPermissions: ['KICK_MEMBERS']
		});
	}

	/**
	 * Run the "kick" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ member: GuildMember, reason: string }} args
	 * @returns {(Promise<Message | Message[] | any>)}
	 * @memberof KickCommand
	 */
	public async run(msg: CommandMessage, args: { member: GuildMember, reason: string }): Promise<Message | Message[] | any> {
		const memberToKick: GuildMember = args.member;
		const kickEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/google/119/eject-symbol_23cf.png',
				name: 'Das Boot'
			},
			color: getEmbedColor(msg),
			description: ''
		});

		if (msg.deletable) await msg.delete();
		
		if (!memberToKick.kickable || !(msg.member.roles.highest.comparePositionTo(memberToKick.roles.highest) > 0)) {
			return sendSimpleEmbeddedError(msg, `I can't kick ${memberToKick}. Do they have the same or a higher role than me or you?`);
		}

		memberToKick.kick(`Kicked by: ${msg.author} for: ${args.reason}`)
			.then(() => {
				kickEmbed.description = `Kicking ${memberToKick} from ${msg.guild} for ${args.reason}!`;

				return msg.embed(kickEmbed);
			})
			.catch((err: Error) => {
				msg.client.emit('error',
					stripIndents`Error with command 'kick'\n
						Banning ${memberToKick} from ${msg.guild} failed!\n
						Error: ${err}`
				);

				return sendSimpleEmbeddedMessage(msg, `Kicking ${memberToKick} failed!`);
			});

		return sendSimpleEmbeddedMessage(msg, 'Loading...');
	}
}
