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
 * Returns Call of Duty: Black Ops 4 stats for a user on a specific platform.
 *
 * @export
 * @class CODBO4StatsCommand
 * @extends {Command}
 */
export default class CODBO4StatsCommand extends Command {
	/**
	 * Creates an instance of CODBO4StatsCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof CODBO4StatsCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['codbo4', 'blops4'],
			description: 'Returns Call of Duty: Black Ops 4 stats for a user on a specific platform. Uses the TrackerNetwork API.',
			extendedHelp: stripIndents`
				syntax: \`!codbo4-stats <platform> <username>\`
				
				Platform must be one of: pc, psn, xbl
			`,
			name: 'codbo4-stats',
			usage: '<platform:string> <username:string>'
		});
	}

	/**
	 * Run the "codbo4-stats" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ platform: string, username: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof CODBO4StatsCommand
	 */
	public async run(msg: KlasaMessage, [platform, username]): Promise<KlasaMessage | KlasaMessage[]> {
		if (!scoutID || !scoutSecret) return sendSimpleEmbeddedError(msg, 'No API Key has been set up. This feature is unusable', 3000);
		const plat = platform === 'pc' ? 'battlenet' : platform;
		const codbo4Embed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://i.imgur.com/90HVaib.png',
				name: 'COD:BLOPS4 Stats',
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

		const search = await Scout.players.search(username, plat, null, ScoutGames.codbo4.id, true, true);
		if (search.results.length) {
			const matches = search.results.filter((result: any) => result.player);
			if (matches.length) {
				// TODO: change this to allow selection of a result
				const firstMatch = matches[0];
				const playerStats = await Scout.players.get(ScoutGames.codbo4.id, firstMatch.player.playerId, '*');
				codbo4Embed.setDescription(stripIndents`
					**${firstMatch.persona.handle}**

					${playerStats.metadata[1].name}: ${playerStats.metadata[1].displayValue}
				`);
				playerStats.stats.forEach((statObj: any) => {
					if (!statObj.displayValue) return;
					codbo4Embed.addField(statObj.metadata.name, statObj.displayValue, true);
				});

				return msg.sendEmbed(codbo4Embed);
			} else {
				return sendSimpleEmbeddedError(msg, 'Unable to find anyone with that player name, check the spelling and try again.', 3000);
			}
		} else {
			return sendSimpleEmbeddedError(msg, 'Unable to find anyone with that player name, check the spelling and try again.', 3000);
		}
	}
}
