import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { sendSimpleEmbeddedError, getEmbedColor } from '../../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

const Scout = require('@scoutsdk/server-sdk');
const games = require('../../../extras/scout-games.json');
const scoutID: string = process.env.spud_scoutid;
const scoutSecret: string = process.env.spud_scoutsecret;

/**
 * Returns Call of Duty: WWII stats for a user on a specific platform.
 *
 * @export
 * @class CODWWIIStatsCommand
 * @extends {Command}
 */
export default class CODWWIIStatsCommand extends Command {
	/**
	 * Creates an instance of CODWWIIStatsCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof CODWWIIStatsCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['codwwii'],
			description: 'Returns Call of Duty: WWII stats for a user on a specific platform. Uses the TrackerNetwork API.',
			extendedHelp: stripIndents`
				syntax: \`!codwwii-stats <platform> <username>\`
				
				Platform must be one of: pc, psn, xbl
			`,
			name: 'codwwii-stats',
			usage: '<platform:string> <username:string>'
		});
	}

	/**
	 * Run the "codwwii-stats" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ platform: string, username: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof CODWWIIStatsCommand
	 */
	public async run(msg: KlasaMessage, [platform, username]): Promise<KlasaMessage | KlasaMessage[]> {
		if (!scoutID || !scoutSecret) {
			return sendSimpleEmbeddedError(msg, 'The codbo4-stats command is not configured yet.');
		}

		const plat = platform === 'pc' ? 'uplay' : platform;
		const codwwiiEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://i.imgur.com/H7AGNoX.png',
				name: 'codwwii Stats',
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

		const search = await Scout.players.search(username, plat, null, games.codwwii.id, true, true);
		if (search.results.length) {
			const matches = search.results.filter((result: any) => result.player);
			if (matches.length) {
				// TODO: change this to allow selection of a result
				const firstMatch = matches[0];
				const playerStats = await Scout.players.get(games.codwwii.id, firstMatch.player.playerId, '*');
				codwwiiEmbed.setDescription(stripIndents`
					**${firstMatch.persona.handle}**

					${playerStats.metadata[1].name}: ${playerStats.metadata[1].displayValue}
				`);
				playerStats.stats.forEach((statObj: any) => {
					if (!statObj.displayValue) return;
					codwwiiEmbed.addField(statObj.metadata.name, statObj.displayValue, true);
				});

				return msg.sendEmbed(codwwiiEmbed);
			} else {
				return sendSimpleEmbeddedError(msg, 'Unable to find anyone with that player name, check the spelling and try again.', 3000);
			}
		} else {
			return sendSimpleEmbeddedError(msg, 'Unable to find anyone with that player name, check the spelling and try again.', 3000);
		}
	}
}
