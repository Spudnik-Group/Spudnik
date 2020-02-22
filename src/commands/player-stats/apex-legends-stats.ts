/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { MessageEmbed } from 'discord.js';
import { sendSimpleEmbeddedError, getEmbedColor, platform } from '../../lib/helpers';
import axios from 'axios';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';
import { SpudConfig } from '../../lib/config';

const apiKey = SpudConfig.trackerApiKey;
const platforms: { [platform: string]: number } = {
	'pc': 5,
	'psn': 2,
	'xbl': 1
};

/**
 * Returns Apex Legends stats for a user on a specific platform.
 *
 * @export
 * @class ApexLegendsStatsCommand
 * @extends {Command}
 */
export default class ApexLegendsStatsCommand extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['apex', 'apex-stats'],
			description: 'Returns Apex Legends stats for a user on a specific platform.',
			extendedHelp: stripIndents`
				Platform must be one of: ${Object.keys(platforms).join(', ')}
			`,
			name: 'apex-legends-stats',
			usage: '<platform:string> <username:string>'
		});

		this.createCustomResolver('platform', platform);
	}

	/**
	 * Run the "apex-legends-stats" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ platform: string, username: string }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof ApexLegendsStatsCommand
	 */
	public async run(msg: KlasaMessage, [platform, username]): Promise<KlasaMessage | KlasaMessage[]> {
		if (!apiKey) return sendSimpleEmbeddedError(msg, 'No API Key has been set up. This feature is unusable', 3000);
		const apexEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://i.imgur.com/lgC4xLZ.png',
				name: 'Apex Legends Stats',
				url: `https://apex.tracker.gg/profile/${platform}/${encodeURI(username)}`
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

		try {
			const { data: response } = await axios.get(`https://public-api.tracker.gg/apex/v1/standard/profile/${platforms[platform]}/${encodeURI(username)}`, {
				headers: { 'TRN-Api-Key': apiKey }
			});
			if (response.data.children && response.data.children.length) {
				apexEmbed.thumbnail.url = response.data.children[0].metadata.icon || ''
			}

			apexEmbed.fields.push({
				inline: true,
				name: 'User',
				value: response.data.metadata.platformUserHandle
			});

			response.data.stats.forEach((stat: any) => {
				apexEmbed.fields.push({
					inline: true,
					name: stat.metadata.name,
					value: stat.displayValue
				});
			});

			return msg.sendEmbed(apexEmbed);
		} catch (err) {
			let error = 'There was an error with the request. Try again?';
			try {
				if (!err.error) {
					throw 'No error from the api was given.';
				}
				const decodedResponse = JSON.parse(err.error);
				error = decodedResponse.errors[0].message;
			} catch (decodeError) {
				msg.client.emit('warn', `Error in command gaming:apex-legend-stats: ${err}`);
			}

			return sendSimpleEmbeddedError(msg, error, 3000);
		}
	}
}
