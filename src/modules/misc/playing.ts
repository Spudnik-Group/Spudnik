import { stripIndents } from 'common-tags';
import { Message, GuildMember } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage, deleteCommandMessages } from '../../lib/helpers';

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
			args: [
				{
					default: '',
					key: 'game',
					prompt: 'What game are you looking for players for?\n',
					type: 'string'
				}
			],
			description: 'Returns a list of people playing games. Allows filtering.',
			details: stripIndents`
				syntax: \`!playing [game name]\`

				Supplying no game name provides you with a list of all users who are marked with the "Playing" status type.
				Supplying a game name provides you with a list of all users with that game name as their status (case insensitive)`,
			examples: [
				'!playing',
				'!playing fortnite'
			],
			group: 'misc',
			guildOnly: true,
			memberName: 'playing',
			name: 'playing',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "playing" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ game: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof PlayingCommand
	 */
	public async run(msg: CommandoMessage, args: { game: string }): Promise<Message | Message[]> {
        const gameSearch = args.game.toLowerCase();
        const gamePlayers: { [id: string] : Array<GuildMember> } = {};
        msg.guild.members.forEach((member: GuildMember) => {
            if (member.user.bot || !member.presence.activity) {
                return;
            }
            
            const game = member.presence.activity.name.toLowerCase();
            if (game.indexOf(gameSearch) === -1) {
                return;
            }

            if (!gamePlayers.hasOwnProperty(game)) {
                gamePlayers[game] = [];
            }
            gamePlayers[game].push(member);
        });

        const sortedMessage = Object.keys(gamePlayers).sort()
            .map((game) => {
                return gamePlayers[game].sort((a, b) => {
                    const aName = a.displayName.toLowerCase();
                    const bName = b.displayName.toLowerCase();
                    return aName < bName ? -1 : aName > bName ? 1 : 0;
                }).map(member => `<@${member.id}> - ${member.presence.activity.name}`)
                .join('\n');
            }).join('\n');
        deleteCommandMessages(msg, this.client);
        return sendSimpleEmbeddedMessage(msg, sortedMessage);
	}
}
