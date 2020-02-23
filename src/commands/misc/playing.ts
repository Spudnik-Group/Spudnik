/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { GuildMember } from 'discord.js';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Identify anyone playing games in the guild.
 *
 * @export
 * @class PlayingCommand
 * @extends {Command}
 */
export default class PlayingCommand extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Returns a list of people playing games. Allows filtering.',
			extendedHelp: stripIndents`
				Supplying no game name provides you with a list of all users who are marked with the "Playing" status type.
				Supplying a game name provides you with a list of all users with that game name as their status (case insensitive)`,
			name: 'playing',
			usage: '[game:...string]'
		});
	}

	/**
	 * Run the "playing" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ game: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof PlayingCommand
	 */
	public async run(msg: KlasaMessage, [game]): Promise<KlasaMessage | KlasaMessage[]> {
		const gameSearch = game ? game.toLowerCase() : '';
		const gamePlayers: { [id: string]: Array<GuildMember> } = {};

		msg.guild.members.forEach((member: GuildMember) => {
			if (member.user.bot || !member.presence.activities) {
				return;
			}

			const game = member.presence.activities.find(x => x.name.indexOf(gameSearch) !== -1);
			if (!game) {
				return;
			}

			if (!gamePlayers.hasOwnProperty(game.name)) {
				gamePlayers[game.name] = [];
			}
			gamePlayers[game.name].push(member);
		});

		const sortedMessage = Object.keys(gamePlayers).sort()
			.map((game) => {
				return `**${gamePlayers[game][0].presence.activities.find(x => x.name === game).name}**\n` +
					gamePlayers[game].sort((a, b) => {
						const aName = a.displayName.toLowerCase();
						const bName = b.displayName.toLowerCase();

						return aName < bName ? -1 : aName > bName ? 1 : 0;
					}).map(member => `<@${member.id}>`)
						.join('\n');
			}).join('\n\n');

		return sendSimpleEmbeddedMessage(
			msg,
			sortedMessage || (gameSearch ? `Looks like nobody is playing anything like \`${gameSearch}\`.` : 'Nobody is playing anything right now.')
		);
	}
}
