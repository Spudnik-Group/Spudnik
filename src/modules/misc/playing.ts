import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';

/**
 * Identify anyone playing games in the guild.
 *
 * @export
 * @class PlayingCommand
 * @extends {Command}
 */
export default class PlayingCommand extends Command {
	/**
	 * Creates an instance of AcceptCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof PlayingCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			description: 'List people playing games.',
			group: 'misc',
			guildOnly: true,
			memberName: 'playing',
			name: 'playing',
			throttling: {
				duration: 3,
				usages: 2,
			},
			args: [
				{
					default: '',
					key: 'game',
					prompt: 'What game are you looking for players for?\n',
					type: 'string',
				},
			],
		});
	}

	/**
	 * Run the "playing" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof PlayingCommand
	 */
	public async run(msg: CommandMessage, args: { game: string }): Promise<Message | Message[]> {
		const gameSearch = args.game.toLowerCase();
		const playingMembers = msg.guild.members.filter((member) => !member.user.bot && member.presence.activity && member.presence.activity.name.toLowerCase().indexOf(gameSearch) > -1);
		return sendSimpleEmbeddedMessage(msg, playingMembers.map((member) => `<@${member.id}> - ${member.presence.activity.name}`).sort().join('\n'));
	}
}
