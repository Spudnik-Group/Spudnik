import { Message, MessageEmbed, User, GuildMember } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';
import * as format from 'date-fns/format';
import { trimArray } from '../../lib/helpers';
import { deleteCommandMessages } from '../../lib/custom-helpers';
import { stripIndents } from 'common-tags';

const activities = {
	LISTENING: 'Listening to',
	PLAYING: 'Playing',
	STREAMING: 'Streaming',
	WATCHING: 'Watching'
};

/**
 * Returns statistics about a user.
 *
 * @export
 * @class UserCommand
 * @extends {Command}
 */
export default class UserCommand extends Command {
	/**
	 * Creates an instance of UserCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof UserCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['user-stats'],
			args: [
				{
					default: (msg: CommandoMessage) => msg.author,
					key: 'user',
					prompt: 'Which user would you like to get information on?',
					type: 'user'
				}
			],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Returns statistics about a user.',
			details: stripIndents`
				syntax \`!user (@usermention|snowflake|username)\`

				Supplying no usermention returns details about the calling user.
			`,
			examples: [
				'!user',
				'!user @nebula'
			],
			group: 'info',
			guildOnly: true,
			memberName: 'user',
			name: 'user',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "user" command.
	 *
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof UserCommand
	 */
	public async run(msg: CommandoMessage, args: { user: User }): Promise<Message | Message[]> {
		const avatarFormat = args.user.avatar && args.user.avatar.startsWith('a_') ? 'gif' : 'png';
		const userEmbed = new MessageEmbed()
			.setThumbnail(args.user.displayAvatarURL({ format: avatarFormat }))
			.setColor(getEmbedColor(msg))
			.addField('❯ Name', args.user.tag, true)
			.addField('❯ ID', args.user.id, true)
			.addField('❯ Discord Join Date', format(args.user.createdAt, 'MM/DD/YYYY h:mm A'), true)
			.addField('❯ Bot?', args.user.bot ? 'Yes' : 'No', true);
		
		try {
			// Check if user is a member of the guild
			const member: GuildMember = await msg.guild.members.fetch(args.user.id);
			const roles = member.roles
				.filter(role => role.id !== msg.guild.defaultRole.id)
				.sort((a, b) => b.position - a.position)
				.map(role => role.name);
			userEmbed
				.setDescription(member.presence.activity
					? `${activities[member.presence.activity.type]} **${member.presence.activity.name}**`
					: '')
				.addField('❯ Server Join Date', format(member.joinedAt, 'MM/DD/YYYY h:mm A'), true)
				.addField('❯ Nickname', member.nickname || 'None', true)
				.addField('❯ Highest Role',
					member.roles.highest.id === msg.guild.defaultRole.id ? 'None' : member.roles.highest.name, true)
				.addField('❯ Hoist Role', member.roles.hoist ? member.roles.hoist.name : 'None', true)
				.addField(`❯ Roles (${roles.length})`, roles.length ? trimArray(roles, 10).join(', ') : 'None');
			deleteCommandMessages(msg);

			return msg.embed(userEmbed);
		} catch (err) {
			userEmbed.setFooter('Failed to resolve member, showing basic user information instead.');
			deleteCommandMessages(msg);
	
			return msg.embed(userEmbed);
		}
	}
}
