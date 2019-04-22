import { stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { startTyping, sendSimpleEmbeddedError, stopTyping } from '../../lib/helpers';
import { getEmbedColor, deleteCommandMessages } from '../../lib/custom-helpers';
const Scout = require('@scoutsdk/server-sdk');
const games = require('../../extras/scout-games');
const scoutID: string = process.env.spud_scoutid;
const scoutSecret: string = process.env.spud_scoutsecret;

/**
 * Returns Rainbow 6: Siege stats for a user on a specific platform.
 *
 * @export
 * @class R6StatsCommand
 * @extends {Command}
 */
export default class R6StatsCommand extends Command {
	/**
	 * Creates an instance of R6StatsCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof R6StatsCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['r6', 'rainbow6-stats'],
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
			description: 'Returns Rainbow 6: Siege stats for a user on a specific platform. Uses the TrackerNetwork API.',
			details: stripIndents`
				syntax: \`!r6-stats <platform> <username>\`
				
				Platform must be one of: pc, psn, xbl
			`,
			examples: [
				'!r6-stats xbl naterchrdsn',
				'!r6-stats pc nebula-grey'
			],
			group: 'gaming',
			guildOnly: true,
			memberName: 'r6-stats',
			name: 'r6-stats',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "r6-stats" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ platform: string, username: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof R6StatsCommand
	 */
	public async run(msg: CommandoMessage, args: { platform: string, username: string }): Promise<Message | Message[]> {
		const platform = args.platform === 'pc' ? 'uplay' : args.platform;
		const r6Embed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://i.imgur.com/BsQ6ebY.jpg',
				name: 'R6 Stats',
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
		const search = await Scout.players.search(args.username, platform, null, games.r6siege.id, true, true);
		if (search.results.length) {
			const matches = search.results.filter((result: any) => result.player);
			if (matches.length) {
				// TODO: change this to allow selection of a result
				const firstMatch = matches[0];
				const playerStats = await Scout.players.get(games.r6siege.id, firstMatch.player.playerId, '*');
				r6Embed.setDescription(stripIndents`
					**${firstMatch.persona.handle}**

					${playerStats.metadata[1].name}: ${playerStats.metadata[1].displayValue}
				`);
				playerStats.stats.forEach((statObj: any) => {
					if (!statObj.displayValue) return;
					r6Embed.addField(statObj.metadata.name, statObj.displayValue, true);
				});
				deleteCommandMessages(msg);
				stopTyping(msg);

				return msg.embed(r6Embed);
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
