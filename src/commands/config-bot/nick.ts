import { stripIndents } from 'common-tags';
import { GuildMember } from 'discord.js';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Change the bot's nickname on your server, or reset it.
 *
 * @export
 * @class NickCommand
 * @extends {Command}
 */
export default class NickCommand extends Command {

	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			requiredPermissions: ['MANAGE_NICKNAMES'],
			description: 'Used to change the bot\'s nickname on your server, or reset it.',
			extendedHelp: stripIndents`
				Supplying no nickname resets the nickname to default.
			`,
			name: 'nick',
			permissionLevel: 6, // MANAGE_GUILD
			usage: '[nickName:string]'
		});
	}

	/**
	 * Run the "nick" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ nickName: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof NickCommand
	 */
	public async run(msg: KlasaMessage, [nickName]): Promise<KlasaMessage | KlasaMessage[]> {
		if (nickName === '' || nickName === undefined) {
			(msg.guild.me as GuildMember).setNickname('Spudnik', `${msg.author.username} used Spudnik to reset it.`);

			return sendSimpleEmbeddedMessage(msg, 'Bot nickname cleared.');
		} else {
			(msg.guild.me as GuildMember).setNickname(nickName, `${msg.author.username} used Spudnik to set it.`);

			return sendSimpleEmbeddedMessage(msg, 'Bot nickname set.');
		}
	}
}
