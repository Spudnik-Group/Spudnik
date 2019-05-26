import { stripIndents } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { startTyping, sendSimpleEmbeddedError, stopTyping } from '../../lib/helpers';
import { getEmbedColor, deleteCommandMessages } from '../../lib/custom-helpers';
import * as rp from 'request-promise';

const apiKey = process.env.spud_apexapikey;

const platforms: { [platform: string]: number } = {
	'pc': 5,
	'psn': 2,
	'xbl': 1
};

interface ApexLegendsResponse {
	data: ApexLegendsResponseData;
};

interface ApexLegendsResponseData {
	children: Array<ApexLegendsResponseCharacterData>;
	metadata: ApexLegendsResponseMetadata;
	stats: Array<ApexLegendsResponseStat>;
}

interface ApexLegendsResponseMetadata {
	platformUserHandle: string;
}

interface ApexLegendsResponseCharacterData {
	id: string;
	metadata: ApexLegendsResponseCharacterMetadata
}

interface ApexLegendsResponseCharacterMetadata {
	icon: string;
	legend_name: string;
}

interface ApexLegendsResponseStat {
	displayValue: string,
	metadata: ApexLegendsResponseStatMetadata
}

interface ApexLegendsResponseStatMetadata {
	name: string
}


/**
 * Returns Apex Legends stats for a user on a specific platform.
 *
 * @export
 * @class ApexLegendsStatsCommand
 * @extends {Command}
 */
export default class ApexLegendsStatsCommand extends Command {
	/**
	 * Creates an instance of ApexLegendsStatsCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof ApexLegendsStatsCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['apex', 'apex-stats'],
			args: [
				{
					key: 'platform',
					parse: (platform: string) => platform.toLowerCase(),
					prompt: `What platform should I look on?\nOptions are:\n* ${Object.keys(platforms).join('\n* ')}`,
					type: 'string',
					validate: (platform: string) => {
						if (Object.keys(platforms).indexOf(platform.toLowerCase()) !== -1) return true;

						return 'You provided an invalid platform.';
					}
				},
				{
					key: 'username',
					prompt: 'What is the profile name I\'m looking up?',
					type: 'string'
				}
			],
			description: 'Returns Apex Legends stats for a user on a specific platform.',
			details: stripIndents`
				syntax: \`!apex-legends-stats <platform> <username>\`
				
				Platform must be one of: ${Object.keys(platforms).join(', ')}
			`,
			examples: [
				'!apex-legends-stats xbl naterchrdsn',
				'!apex-legends-stats pc nebula-grey'
			],
			group: 'gaming',
			guildOnly: true,
			memberName: 'apex-legends-stats',
			name: 'apex-legends-stats',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "apex-legends-stats" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ platform: string, username: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof ApexLegendsStatsCommand
	 */
	public async run(msg: CommandoMessage, args: { platform: string, username: string }): Promise<Message | Message[]> {
		if (!apiKey) {
			deleteCommandMessages(msg);
			
			return sendSimpleEmbeddedError(msg, 'The apex-legends-stats command is not configured yet.');
		}

		const apexEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://i.imgur.com/lgC4xLZ.png',
				name: 'Apex Legends Stats',
				url: `https://apex.tracker.gg/profile/${args.platform}/${encodeURI(args.username)}`
			},
			color: getEmbedColor(msg),
			description: '',
			fields: [],
			footer: {
				text: 'powered by apex.tracker.gg'
			},
			thumbnail: {
				url: ''
			}
		});	

		startTyping(msg);

		return rp(`https://public-api.tracker.gg/apex/v1/standard/profile/${platforms[args.platform]}/${encodeURI(args.username)}`, {
			headers: { 'TRN-Api-Key': apiKey }
		}).then((content: string) => {
			const response: ApexLegendsResponse = JSON.parse(content);
			if (response.data.children && response.data.children.length) {
				apexEmbed.thumbnail.url = response.data.children[0].metadata.icon || ''
			}

			apexEmbed.fields.push({
				inline: true,
				name: 'User',
				value: response.data.metadata.platformUserHandle
			});

			response.data.stats.forEach((stat) => {
				apexEmbed.fields.push({
					inline: true,
					name: stat.metadata.name,
					value: stat.displayValue
				});
			});
			
			deleteCommandMessages(msg);
			stopTyping(msg);
			
			return msg.embed(apexEmbed);
		}).catch((response) => {
			let error = 'There was an error with the request. Try again?';
			try {
				if (!response.error) {
					throw 'No error from the api was given.';
				}
				const decodedResponse = JSON.parse(response.error);
				error = decodedResponse.errors[0].message;
			} catch (decodeError) {
				msg.client.emit('warn', `Error in command gaming:apex-legend-stats: ${response}`);
			}
			stopTyping(msg);

			return sendSimpleEmbeddedError(msg, error, 3000);
		});
	}
}
