import { stripIndents } from 'common-tags';
import { GuildMember, Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage, deleteCommandMessages } from '../../lib/helpers';

/**
 * Change the bot's nickname on your server, or reset it.
 *
 * @export
 * @class NickCommand
 * @extends {Command}
 */
export default class NickCommand extends Command {
	/**
	 * Creates an instance of NickCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof NickCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					default: '',
					key: 'nickName',
					prompt: 'what is the nickname you\'d like to set?\n',
					type: 'string'
				}
			],
			clientPermissions: ['MANAGE_NICKNAMES'],
			description: 'Used to change the bot\'s nickname on your server, or reset it.',
			details: stripIndents`
				syntax: \`!nick (new nickname)\`

				Supplying no nickname resets the nickname to default.

				MANAGE_NICKNAMES permission required.
			`,
			examples: [
				'!nick',
				'!nick AwesomeBot'
			],
			group: 'util',
			guildOnly: true,
			memberName: 'nick',
			name: 'nick',
			throttling: {
				duration: 3,
				usages: 2
			},
			userPermissions: ['MANAGE_NICKNAMES']
		});
	}

	/**
	 * Run the "nick" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ nickName: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof NickCommand
	 */
	public async run(msg: CommandoMessage, args: { nickName: string }): Promise<Message | Message[]> {
		deleteCommandMessages(msg, this.client);
		
		if (args.nickName === '' || args.nickName === undefined) {
			(msg.guild.me as GuildMember).setNickname('Spudnik', `${msg.author.username} used Spudnik to reset it.`);
			return sendSimpleEmbeddedMessage(msg, 'Bot nickname cleared.');
		} else {
			(msg.guild.me as GuildMember).setNickname(args.nickName, `${msg.author.username} used Spudnik to set it.`);
			return sendSimpleEmbeddedMessage(msg, 'Bot nickname set.');
		}
	}
}
