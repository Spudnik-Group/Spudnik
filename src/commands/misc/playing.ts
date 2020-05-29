/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { GuildMember, Activity } from 'discord.js';
import { Command, CommandStore, KlasaMessage } from 'klasa';

/**
 * Identify anyone playing games in the guild.
 *
 * @export
 * @class PlayingCommand
 * @extends {Command}
 */
export default class PlayingCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Returns a list of people playing games. Allows filtering.',
			extendedHelp: stripIndents`
				Supplying no game name provides you with a list of all users who are marked with the "Playing" status type.
				Supplying a game name provides you with a list of all users with that game name as their status (case insensitive)`,
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
	public run(msg: KlasaMessage, [game]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		const gameSearch = game ? game.toLowerCase() : '';
		const gamePlayers: { [id: string]: Array<GuildMember> } = {};

		msg.guild.members.forEach((member: GuildMember) => {
			if (member.user.bot || !member.presence.activities.length) {
				return;
			}

			const game = member.presence.activities.find((activity: Activity) => {
				if (member.presence.activities.length > 1 && activity.name === 'Custom Status') {
					return false;
				}

				return activity.name.toLowerCase().includes(gameSearch);
			});
			if (!game) {
				return;
			}

			if (!gamePlayers.hasOwnProperty(game.name)) {
				gamePlayers[game.name] = [];
			}
			gamePlayers[game.name].push(member);
		});

		const sortedMessage = Object.keys(gamePlayers)
			.sort()
			.map((game: string) => `**${gamePlayers[game][0].presence.activities.find((activity: Activity) => activity.name === game).name}**\n${
				gamePlayers[game]
					.sort((a: GuildMember, b: GuildMember) => a.displayName.localeCompare(b.displayName))
					.map((member: GuildMember) => `<@${member.id}>`)
					.join('\n')}`)
			.join('\n\n');

		return msg.sendSimpleEmbed(sortedMessage || (gameSearch ? `Looks like nobody is playing anything like \`${gameSearch}\`.` : 'Nobody is playing anything right now.'));
	}

}
