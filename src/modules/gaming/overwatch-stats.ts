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
 * Returns Overwatch stats for a user on a specific platform and region.
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
	 * @param {OverwatchStatsArguments} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof OverwatchStatsCommand
	 */
	public async run(msg: CommandoMessage, args: OverwatchStatsArguments): Promise<Message | Message[]> {
		startTyping(msg);

		return getProfile(args.platform, args.region, args.battletag.replace('#', '-'), (error: Error, profile: Profile) => {
			if (error) {
				msg.client.emit('warn', `Error in command gaming:overwatch-stats: ${error}`);

				stopTyping(msg);

				return sendSimpleEmbeddedError(msg, 'Error with the API call. Please try again later.', 3000);
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
				stopTyping(msg);
				deleteCommandMessages(msg, this.client);

				return msg.embed(overwatchEmbed);
			} else {
				stopTyping(msg);

				return sendSimpleEmbeddedError(msg, 'Unable to find anyone with that player name, check the spelling and try again.', 3000);
			}
		});
	}
}
