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
 * Returns Fortnite stats for a user on a specific platform.
 *
 * @export
 * @class FortniteStatsCommand
 * @extends {Command}
 */
export default class FortniteStatsCommand extends Command {
	/**
	 * Creates an instance of FortniteStatsCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof FortniteStatsCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['fortnite'],
			description: 'Returns Fortnite stats for a user on a specific platform. Uses the TrackerNetwork API.',
			extendedHelp: stripIndents`
				syntax: \`!fortnite-stats <platform> <username>\`
				
				Platform must be one of: pc, psn, xbl
			`,
			name: 'fortnite-stats',
			usage: '<platform:string> <username:string>'
		});
	}

	/**
	 * Run the "fornite-stats" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ platform: string, username: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof FortniteStatsCommand
	 */
	public async run(msg: KlasaMessage, [platform, username]): Promise<KlasaMessage | KlasaMessage[]> {
		if (!scoutID || !scoutSecret) return sendSimpleEmbeddedError(msg, 'No API Key has been set up. This feature is unusable', 3000);
		const plat = platform === 'pc' ? 'epic' : platform;
		const fortniteEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://i.imgur.com/HJo2RkT.png',
				name: 'Fortnite Stats',
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

		const search = await Scout.players.search(username, plat, null, ScoutGames.fortnite.id, true, true);
		if (search.results.length) {
			const matches = search.results.filter((result: any) => result.player);
			if (matches.length) {
				// TODO: change this to allow selection of a result
				const firstMatch = matches[0];
				const playerStats = await Scout.players.get(ScoutGames.fortnite.id, firstMatch.player.playerId, '*');
				fortniteEmbed.setDescription(stripIndents`
					**${firstMatch.persona.handle}**

					${playerStats.metadata[1].name}: ${playerStats.metadata[1].displayValue}
				`);
				playerStats.stats.forEach((statObj: any) => {
					if (!statObj.displayValue) return;
					fortniteEmbed.addField(statObj.metadata.name, statObj.displayValue, true);
				});

				return msg.sendEmbed(fortniteEmbed);
			} else {
				return sendSimpleEmbeddedError(msg, 'Unable to find anyone with that player name, check the spelling and try again.', 3000);
			}
		} else {
			return sendSimpleEmbeddedError(msg, 'Unable to find anyone with that player name, check the spelling and try again.', 3000);
		}
	}
}
