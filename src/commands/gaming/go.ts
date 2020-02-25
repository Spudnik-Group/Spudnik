/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import { getEmbedColor, sendSimpleEmbeddedError } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { SteamGames } from '@lib/constants';

const steamGameNames = Object.keys(SteamGames).map(item => `* ${item}`).join('\n');

/**
 * Displays a link to launch a steam game.
 *
 * @export
 * @class GoCommand
 * @extends {Command}
 */
export default class GoCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['play-game', 'lets-play', 'go-play'],
			description: 'Displays a link to launch a steam game.',
			extendedHelp: stripIndents`
				Only a few games have been added at this time, submit a ticket on our GitHub to request specific ones.
			`,
			name: 'go',
			usage: '<game:string>'
		});
	}

	/**
	 * Run the "go" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ game: string, member: GuildMember }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof GoCommand
	 */
	public async run(msg: KlasaMessage, [game]): Promise<KlasaMessage | KlasaMessage[]> {
		if (!Object.keys(SteamGames).includes(game.toUpperCase())) {
			return sendSimpleEmbeddedError(msg, `Sorry, only a few games are supported at this time: \n ${steamGameNames}`, 5000);
		}
		const gameID = SteamGames[game.toUpperCase()];

		return msg.sendEmbed(new MessageEmbed()
			.setColor(getEmbedColor(msg))
			.setAuthor(`${msg.author.username}`, `${msg.author.displayAvatarURL()}`)
			.setThumbnail(`${msg.author.displayAvatarURL()}`)
			.setTitle('Let\'s Play!')
			.setDescription(`**Launch game:** steam://run/${gameID}`)
			.setImage(`http://cdn.edgecast.steamstatic.com/steam/apps/${gameID}/header.jpg`));
	}

}
