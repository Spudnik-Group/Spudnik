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
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['csgo'],
			args: [
				{
					key: 'username',
					prompt: 'What is the profile name I\'m looking up?',
					type: 'string'
				}
			],
			description: 'Returns Counter Strike: Global Offensive stats for a user. Uses the TrackerNetwork API.',
			details: 'syntax: \`!csgo-stats <username>\`',
			examples: ['!csgo-stats phreakslayer'],
			group: 'gaming',
			guildOnly: true,
			memberName: 'csgo-stats',
			name: 'csgo-stats',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "csgo-stats" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ username: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof CSGOStatsCommand
	 */
	public async run(msg: CommandoMessage, args: { username: string }): Promise<Message | Message[]> {
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

		startTyping(msg);
		const search = await Scout.players.search(args.username, 'steam', null, games.csgo.id, true, true);
		if (search.results.length) {
			const matches = search.results.filter((result: any) => result.player);
			if (matches.length) {
				// TODO: change this to allow selection of a result
				const firstMatch = matches[0];
				const playerStats = await Scout.players.get(games.csgo.id, firstMatch.player.playerId, '*');
				csgoEmbed.setDescription(stripIndents`
					**${firstMatch.persona.handle}**

					${playerStats.metadata[1].name}: ${playerStats.metadata[1].displayValue}
				`);
				playerStats.stats.forEach((statObj: any) => {
					if (!statObj.displayValue) return;
					csgoEmbed.addField(statObj.metadata.name, statObj.displayValue, true);
				});
				deleteCommandMessages(msg, this.client);
				stopTyping(msg);

				return msg.embed(csgoEmbed);
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
