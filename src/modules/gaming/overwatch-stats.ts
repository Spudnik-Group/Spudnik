import { stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { startTyping, stopTyping, deleteCommandMessages, sendSimpleEmbeddedError } from '../../lib/helpers';
import * as rp from 'request-promise';

interface Sportsmanship {
	value: number;
	rate: number;
}

interface Shotcaller {
	value: number;
	rate: number;
}

interface Teammate {
	value: number;
	rate: number;
}

interface Endorsement {
	sportsmanship: Sportsmanship;
	shotcaller: Shotcaller;
	teammate: Teammate;
	level: number;
	frame: string;
	icon: string;
}

interface Quickplay {
	won: number;
}

interface Competitive {
	won: number;
	lost: number;
	draw: number;
	played: number;
	win_rate: number;
}

interface Games {
	quickplay: Quickplay;
	competitive: Competitive;
}

interface Playtime {
	quickplay: string;
	competitive: string;
}

interface CompetitiveRank {
	rank: number;
	rank_img: string;
}

interface OverwatchProfile {
	username: string;
	level: number;
	portrait: string;
	endorsement: Endorsement;
	private: boolean;
	games: Games;
	playtime: Playtime;
	competitive: CompetitiveRank;
	levelFrame: string;
	star: string;
	message: string;
}


/**
 * Post information about a player's overwatch stats.
 *
 * @export
 * @class OverwatchStatsCommand
 * @extends {Command}
 */
export default class OverwatchStatsCommand extends Command {
	/**
	 * Creates an instance of OverwatchStatsCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof OverwatchStatsCommand
	 */
	
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'platform',
					parse: (platform: string): string => platform.toLowerCase(),
					prompt: 'What platform should I look on?\nOptions are:\n* xbl\n* pc\n* psn',
					type: 'string',
					validate: (platform: string) => {
						const allowedSubCommands = ['xbl', 'pc', 'psn'];
						if (allowedSubCommands.indexOf(platform.toLowerCase()) !== -1) return true;

						return 'You provided an invalid platform.';
					}
				},
				{
					key: 'battletag',
					parse: (battletag: string): string => battletag.replace('#', '-'),
					prompt: 'What is the battletag I\'m looking up? (case-sensitive)',
					type: 'string'
				},
				{
					default: 'us',
					key: 'region',
					parse: (region: string): string => region.toLowerCase(),
					prompt: 'What region should I look in?\nOptions are:\n* us\n* eu\n* kr\n* cn\n* global',
					type: 'string',
					validate: (region: string) => {
						const options: Array<string> = ['us', 'eu', 'kr', 'cn', 'global'];
						if (options.indexOf(region) !== -1) return true;
						
						return 'You provided an invalid region.';
					}
				}
			],
			description: 'Returns Overwatch stats for a user on a specific platform and region. ',
			details: stripIndents`
				syntax: \`!overwatch-stats <platform: pc|xbl|psn> <battletag> <region: eu|us|kr|cn|global>\`
			`,
			examples: [
				'!overwatch-stats pc Mythos-11321',
				'!overwatch-stats psn Mythos11321 us'
			],
			group: 'gaming',
			guildOnly: true, 
			memberName: 'overwatch-stats',
			name: 'overwatch-stats',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "overwatch-stats" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ platform: string, battletag: string, region: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof OverwatchStatsCommand
	 */
	public async run(msg: CommandoMessage, args: { platform: string, battletag: string, region: string }): Promise<Message | Message[]> {
		startTyping(msg);

		return rp(`https://overwatchy.com/profile/${args.platform}/${args.region}/${encodeURI(args.battletag)}`)
			.then((content: string) => {
				const profile: OverwatchProfile = JSON.parse(content);

				if (profile.message) {
					stopTyping(msg);

					return sendSimpleEmbeddedError(msg, profile.message, 3000);
				}

				const overwatchEmbed: MessageEmbed = new MessageEmbed({
					author: {
						icon_url: profile.competitive ? profile.competitive.rank_img : null,
						name: `${args.battletag.replace('-', '#')}'s Overwatch Stats`,
						url: `https://playoverwatch.com/career/${args.platform}/${encodeURI(args.battletag)}`
					},
					fields: [
						{
							inline: true,
							name: 'Level',
							value: profile.level.toString()
						},
						{
							inline: true,
							name: 'Rank',
							value: profile.competitive.rank ? profile.competitive.rank.toString() : 'N/A'
						},
						{
							inline: true,
							name: 'Competitive Playtime',
							value: profile.playtime.competitive || '0'
						},
						{
							inline: true,
							name: 'Competitive Win Rate',
							value: profile.games.competitive.win_rate ? `${profile.games.competitive.win_rate}%` : 'N/A'
						},
						{
							inline: true,
							name: 'Quickplay Playtime',
							value: profile.playtime.quickplay || '0'
						},
						{
							inline: true,
							name: 'Quickplay Games Won',
							value: profile.games.quickplay.won ? profile.games.quickplay.won.toString() : '0'
						}
					],
					thumbnail: {
						url: profile.portrait
					}
				});
				
				if (profile.endorsement) {
					overwatchEmbed.fields.push(
						{
							inline: true,
							name: 'Endorsement Level',
							value: profile.endorsement.level.toString()
						},
						{
							inline: true,
							name: 'Sportsmanship',
							value: profile.endorsement.sportsmanship.rate !== null ? `${profile.endorsement.sportsmanship.rate}%` : 'N/A'
						},
						{
							inline: true,
							name: 'Shotcaller',
							value: profile.endorsement.shotcaller.rate !== null ? `${profile.endorsement.shotcaller.rate}%` : 'N/A'
						},
						{
							inline: true,
							name: 'Good Teammate',
							value: profile.endorsement.teammate.rate !== null ? `${profile.endorsement.teammate.rate}%` : 'N/A'
						}
					);
				}
				deleteCommandMessages(msg, this.client);
				stopTyping(msg);

				return msg.embed(overwatchEmbed);
			}).catch(error => {
				msg.client.emit('warn', `Error in command gaming:overwatch-stats: ${error}`);
				stopTyping(msg);
	
				return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
			});
	}
}
