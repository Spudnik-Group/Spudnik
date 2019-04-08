import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { stripIndents } from 'common-tags';
import { getEmbedColor } from '../../lib/custom-helpers';

// tslint:disable-next-line:-no-var-requires
const steamGames = require('../../extras/steam-games');
const steamGameNames = Object.keys(steamGames).map(item => {
	return `* ${item}\n`
});

/**
 * Displays a link to launch a steam game.
 *
 * @export
 * @class GoCommand
 * @extends {Command}
 */
export default class GoCommand extends Command {
	/**
	 * Creates an instance of GoCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof GoCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['play-game', 'lets-play', 'go-play'],
			args: [
				{
					key: 'game',
					prompt: stripIndents`What game do you want to play?
						Options are:
						${steamGameNames}
					`,
					type: 'string',
					validate: (game: string) => {
						if (Object.keys(steamGames).indexOf(game.toUpperCase()) !== -1) return true;

						return 'Sorry, but only certain games are supported by this command at this time. See the list by running `!help go`';
					}
				}
			],
			description: 'Displays a link to launch a steam game.',
			details: stripIndents`
				syntax: \`!go gameName\`
			`,
			examples: [
				'!go csgo',
				'!go pubg'
			],
			group: 'gaming',
			guildOnly: true,
			memberName: 'go',
			name: 'go',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "go" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ game: string, member: GuildMember }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof GoCommand
	 */
	public async run(msg: CommandoMessage, args: {game: string}): Promise<Message | Message[]> {
		const gameID = steamGames[args.game.toUpperCase()];

		return msg.embed(new MessageEmbed()
			.setColor(getEmbedColor(msg))
			.setAuthor(`${msg.author.username}`, `${msg.author.displayAvatarURL()}`)
			.setThumbnail(`${msg.author.displayAvatarURL()}`)
			.setTitle('Let\'s Play!')
			.setDescription(`**Launch game:** steam://run/${gameID}`)
			.setImage(`http://cdn.edgecast.steamstatic.com/steam/apps/${gameID}/header.jpg`));
	}
}
