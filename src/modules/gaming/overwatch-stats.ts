import { stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { startTyping, stopTyping, deleteCommandMessages, sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';
import { getProfile, Profile, PLATFORM, REGION } from 'overwatch-api';

class OverwatchStatsArguments { 
	battletag: string; 
	platform: PLATFORM;
	region: REGION;
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
					prompt: 'Choose a platform: pc | xbl | psn',
					type: 'string',
					validate: (platform: string): boolean | string => {
						const options: Array<string> = ['pc', 'xbl', 'psn'];
						if (options.indexOf(platform) === -1) {
							return `Platform must be one of the following: ${options.join(', ')}.`
						}
						
						return true;
					}
				},
				{
					key: 'battletag',
					parse: (battletag: string): string => battletag.replace('#', '-'),
					prompt: 'Enter the battletag (case-sensitive)?',
					type: 'string'
				},
				{
					default: 'us',
					key: 'region',
					parse: (region: string): string => region.toLowerCase(),
					prompt: 'Choose a region: us | eu | kr | cn | global',
					type: 'string',
					validate: (region: string) => {
						const options: Array<string> = ['us', 'eu', 'kr', 'cn', 'global'];
						if (options.indexOf(region) === -1) {
							return `Region must be one of the following: ${options.join(', ')}.`
						}
						
						return true;
					}
				}
			],
			description: 'Returns overwatch stats about a player.',
			details: stripIndents`
				syntax: \`!overwatch-stats <platform: pc|xb1|psn> <battletag> <region: eu|us>\`
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
	 * @param {OverwatchStatsArguments} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof OverwatchStatsCommand
	 */
	public async run(msg: CommandoMessage, args: OverwatchStatsArguments): Promise<Message | Message[]> {
		startTyping(msg);

		// Make the api call.
		getProfile(args.platform, args.region, args.battletag.replace('#', '-'), (error: Error, profile: Profile) => {
			stopTyping(msg);

			if (error) {
				return sendSimpleEmbeddedError(msg, `The api returned the following error: ${error.message}.`, 3000);
			} else if (profile) {
				const overwatchEmbed: MessageEmbed = new MessageEmbed({
					author: {
						icon_url: profile.competitive ? profile.competitive.rank_img : null,
						name: args.battletag.replace('-', '#'),
						url: `https://playoverwatch.com/career/${args.platform}/${args.battletag}`
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
							value: `${profile.endorsement.sportsmanship.rate}%`
						},
						{
							inline: true,
							name: 'Shotcaller',
							value: `${profile.endorsement.shotcaller.rate}%`
						},
						{
							inline: true,
							name: 'Good Teammate',
							value: `${profile.endorsement.teammate.rate}%`
						}
					);
				}
				deleteCommandMessages(msg, this.client);

				return msg.embed(overwatchEmbed);
			} else {
				return sendSimpleEmbeddedError(msg, 'Something is weird. No profile or errors were found.', 3000);
			}
		});

		return sendSimpleEmbeddedMessage(msg, 'Searching for overwatch stats.');
	}
}
