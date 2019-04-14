import { stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { startTyping, sendSimpleEmbeddedError, deleteCommandMessages, stopTyping } from '../../lib/helpers';
import { getEmbedColor } from '../../lib/custom-helpers';
const Scout = require('@scoutsdk/server-sdk');
const games = require('../../extras/scout-games');
const scoutID: string = process.env.spud_scoutid;
const scoutSecret: string = process.env.spud_scoutsecret;

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
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['codbo4', 'blops4'],
			args: [
				{
					key: 'platform',
					parse: (platform: string) => {
						return platform.toLowerCase();
					},
					prompt: 'What platform should I look on?\nOptions are:\n* xbl\n* pc\n* psn',
					type: 'string',
					validate: (platform: string) => {
						const allowedSubCommands = ['xbl', 'pc', 'psn'];
						if (allowedSubCommands.indexOf(platform.toLowerCase()) !== -1) return true;

						return 'You provided an invalid platform.';
					}
				},
				{
					key: 'username',
					prompt: 'What is the profile name I\'m looking up?',
					type: 'string'
				}
			],
			description: 'Returns Call of Duty: Black Ops 4 stats for a user on a specific platform. Uses the TrackerNetwork API.',
			details: stripIndents`
				syntax: \`!codbo4-stats <platform> <username>\`
				
				Platform must be one of: xbl, pc, psn
			`,
			examples: [
				'!codbo4-stats xbl naterchrdsn',
				'!codbo4-stats pc nebula-grey'
			],
			group: 'gaming',
			guildOnly: true,
			memberName: 'codbo4-stats',
			name: 'codbo4-stats',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "codbo4-stats" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ platform: string, username: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof CODBO4StatsCommand
	 */
	public async run(msg: CommandoMessage, args: { platform: string, username: string }): Promise<Message | Message[]> {
		const platform = args.platform === 'pc' ? 'battlenet' : args.platform;
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

		startTyping(msg);
		const search = await Scout.players.search(args.username, platform, null, games.codbo4.id, true, true);
		if (search.results.length) {
			const matches = search.results.filter((result: any) => result.player);
			if (matches.length) {
				// TODO: change this to allow selection of a result
				const firstMatch = matches[0];
				const playerStats = await Scout.players.get(games.codbo4.id, firstMatch.player.playerId, '*');
				codbo4Embed.setDescription(stripIndents`
					**${firstMatch.persona.handle}**

					${playerStats.metadata[1].name}: ${playerStats.metadata[1].displayValue}
				`);
				playerStats.stats.forEach((statObj: any) => {
					if (!statObj.displayValue) return;
					codbo4Embed.addField(statObj.metadata.name, statObj.displayValue, true);
				});
				deleteCommandMessages(msg, this.client);
				stopTyping(msg);

				return msg.embed(codbo4Embed);
			} else {
				stopTyping(msg);
	
				return sendSimpleEmbeddedError(msg, 'Unable to find anyone with that player name, check the spelling and try again.', 3000);
			}
		} else {
			stopTyping(msg);

			return sendSimpleEmbeddedError(msg, 'Unable to find anyone with that player name, check the spelling and try again.', 3000);
		}
	}
}
