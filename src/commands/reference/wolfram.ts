/**
 * Copyright (c) 2020 Spudnik Group
 */

import axios from 'axios';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { MessageEmbed } from 'discord.js';
import { SpudConfig } from '@lib/config';
import { baseEmbed } from '@lib/helpers/embed-helpers';

const wolframAppID = SpudConfig.wolframApiKey;

export default class WolframCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['wa'],
			description: 'Query Wolfram Alpha with any mathematical question.',
			name: 'wolfram',
			usage: '<query:...string>'
		});

		this.customizeResponse('query', 'Please supply a query for Wolfram Alpha.');
	}

	public async run(msg: KlasaMessage, [query]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		if (!wolframAppID) return msg.sendSimpleError('No API Key has been set up. This feature is unusable', 3000);
		const responseEmbed: MessageEmbed = baseEmbed(msg)
			.setAuthor(
				'Wolfram Alpha',
				'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Mathematica_Logo.svg/1200px-Mathematica_Logo.svg.png',
				'https://wolframalpha.com'
			);

		try {
			const pods = await axios.get('http://api.wolframalpha.com/v2/query', {
				params: {
					appid: wolframAppID,
					input: query,
					output: 'json',
					primary: true
				}
			}).then((body: any) => body.data.queryresult.pods);

			if (!pods || pods.error) throw new Error("Couldn't find an answer to that question!");

			responseEmbed.addField(
				'**Input Interpretation:**',
				pods[0].subpods[0].plaintext,
				true
			);

			let somethingReturned = false;

			const plot = pods.find((x: any) => x.title.toLowerCase() === 'plot');
			const altForm = pods.find((x: any) => x.title.toLowerCase() === 'alternate form');
			const result = pods.find((x: any) => x.title.toLowerCase() === 'result');
			const decApprox = pods.find((x: any) => x.title.toLowerCase() === 'decimal approximation');
			const decForm = pods.find((x: any) => x.title.toLowerCase() === 'decimal form');

			if (plot) {
				responseEmbed.addField(
					'**Alternate Form:**',
					altForm.subpods[0].plaintext.substring(0, 1500),
					true
				);

				responseEmbed.setImage(plot.subpods[0].img.src);

				somethingReturned = true;
			}

			if (result) {
				responseEmbed.addField(
					'**Result:**',
					result.subpods[0].plaintext.substring(0, 1500),
					true
				);

				somethingReturned = true;
			}

			if (decApprox) {
				responseEmbed.addField(
					'**Decimal Approximation:**',
					decApprox.subpods[0].plaintext.substring(0, 1500),
					true
				);

				somethingReturned = true;
			}

			if (decForm) {
				responseEmbed.addField(
					'**Decimal Form:**',
					decForm.subpods[0].plaintext.substring(0, 1500),
					true
				);

				somethingReturned = true;
			}

			if (!somethingReturned) {
				throw new Error(`Couldn't interpret an answer to that question! Try looking manually?\nhttps://www.wolframalpha.com/input/?i=${encodeURIComponent(pods[0].subpods[0].plaintext)}`);
			}

			// Send the success response
			return msg.sendEmbed(responseEmbed);
		} catch (err) {
			msg.client.emit('warn', `Error in command ref:wolfram: ${err}`);

			return msg.sendSimpleError('There was an error with the request. Make sure your query is something WolframAlpha can handle and try again.', 5000);
		}
	}

}
