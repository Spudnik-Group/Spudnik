import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { sendSimpleEmbeddedError, getEmbedColor } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';
import { SpudConfig } from '../../lib/config';
import * as Scout from '@scoutsdk/server-sdk';
import { ScoutGames } from '../../lib/constants';

const scoutID: string = SpudConfig.scoutId;
const scoutSecret: string = SpudConfig.scoutSecret;

/**
 * Returns Counter Strike: Global Offensive stats for a user on a specific platform.
 *
 * @export
 * @class CSGOStatsCommand
 * @extends {Command}
 */
export default class CSGOStatsCommand extends Command {
	/**
	 * Creates an instance of CSGOStatsCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof CSGOStatsCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['csgo'],
			description: 'Returns Counter Strike: Global Offensive stats for a user. Uses the TrackerNetwork API.',
			extendedHelp: 'syntax: \`!csgo-stats <username>\`',
			name: 'csgo-stats',
			usage: '<username:string>'
		});
	}

	/**
	 * Run the "csgo-stats" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ username: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof CSGOStatsCommand
	 */
	public async run(msg: KlasaMessage, [username]): Promise<KlasaMessage | KlasaMessage[]> {
		if (!scoutID || !scoutSecret) return sendSimpleEmbeddedError(msg, 'No API Key has been set up. This feature is unusable', 3000);
		const csgoEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://i.imgur.com/UBjioW8.png',
				name: 'CS:GO Stats',
				url: 'https://scoutsdk.com/'
			},
			color: getEmbedColor(msg),
			description: '',
			footer: {
				text: 'powered by ScoutSDK'
			}
		});
		await Scout.configure({
			clientId: scoutID,
			clientSecret: scoutSecret,
			scope: 'public.read'
		});

		const search = await Scout.players.search(username, 'steam', null, ScoutGames.csgo.id, true, true);
		if (search.results.length) {
			const matches = search.results.filter((result: any) => result.player);
			if (matches.length) {
				// TODO: change this to allow selection of a result
				const firstMatch = matches[0];
				const playerStats = await Scout.players.get(ScoutGames.csgo.id, firstMatch.player.playerId, '*');
				csgoEmbed.setDescription(stripIndents`
					**${firstMatch.persona.handle}**

					${playerStats.metadata[1].name}: ${playerStats.metadata[1].displayValue}
				`);
				playerStats.stats.forEach((statObj: any) => {
					if (!statObj.displayValue) return;
					csgoEmbed.addField(statObj.metadata.name, statObj.displayValue, true);
				});

				return msg.sendEmbed(csgoEmbed);
			} else {
				return sendSimpleEmbeddedError(msg, 'Unable to find anyone with that player name, check the spelling and try again.', 3000);
			}
		} else {
			return sendSimpleEmbeddedError(msg, 'Unable to find anyone with that player name, check the spelling and try again.', 3000);
		}
	}
}
