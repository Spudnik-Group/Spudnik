import axios from 'axios';
import { Command, KlasaClient, CommandStore } from 'klasa';
import { stripIndents } from 'common-tags';
import { sendSimpleEmbeddedError, getEmbedColor } from '../../lib/helpers';
import { MessageEmbed } from 'discord.js';
import { SpudConfig } from '../../lib/config';

const wolframAppID = SpudConfig.wolframApiKey;

export default class WolframCommand extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Query Wolfram Alpha with any mathematical question.',
			name: 'wolfram',
			extendedHelp: stripIndents`
				syntax: \`!wolfram <query>\`
			`,
			usage: '<query:string>'
		});

		this.customizeResponse('query', 'Please supply a query');
	}

	async run(msg, [query]) {
		if (!wolframAppID) return sendSimpleEmbeddedError(msg, 'No API Key has been set up. This feature is unusable', 3000);
		const responseEmbed: MessageEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			description: '',
			author: {
				icon_url: 'http://products.wolframalpha.com/api/img/spikey.svg',
				name: 'Wolfram Alpha',
				url: 'https://wolframalpha.com'
			}
		})

		try {
			const { data: pods } = await axios.get('http://api.wolframalpha.com/v2/query', {
				params: {
					appid: wolframAppID,
					input: query,
					output: 'json',
					primary: true,
				}
			})
				.then((body: any) => body.body.queryresult.pods)

			if (!pods || pods.error) throw "Couldn't find an answer to that question!";

			responseEmbed.setDescription(stripIndents`
			**Input Interpretation:** ${pods[0].subpods[0].plaintext}

			**Result:** ${pods[1].subpods[0].plaintext.substring(0, 1500)}
			`);

			// Send the success response
			return msg.sendEmbed(responseEmbed);
		} catch (err) {
			msg.client.emit('warn', `Error in command ref:wolfram: ${err}`);

			return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
		};
	}
};
