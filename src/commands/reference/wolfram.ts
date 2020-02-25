/**
 * Copyright (c) 2020 Spudnik Group
 */

import axios from 'axios';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { sendSimpleEmbeddedError, getEmbedColor } from '@lib/helpers';
import { MessageEmbed } from 'discord.js';
import { SpudConfig } from '@lib/config';

const wolframAppID = SpudConfig.wolframApiKey;

export default class WolframCommand extends Command {

	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['wa'],
			description: 'Query Wolfram Alpha with any mathematical question.',
			name: 'wolfram',
			usage: '<query:...string>'
		});

		this.customizeResponse('query', 'Please supply a query');
	}

	public async run(msg: KlasaMessage, [query]): Promise<KlasaMessage | KlasaMessage[]> {
		if (!wolframAppID) return sendSimpleEmbeddedError(msg, 'No API Key has been set up. This feature is unusable', 3000);
		const responseEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Mathematica_Logo.svg/1200px-Mathematica_Logo.svg.png',
				name: 'Wolfram Alpha',
				url: 'https://wolframalpha.com'
			},
			color: getEmbedColor(msg),
			description: ''
		});

		try {
			const pods = await axios.get('http://api.wolframalpha.com/v2/query', {
				params: {
					appid: wolframAppID,
					input: query,
					output: 'json',
					primary: true
				}
			}).then((body: any) => body.data.queryresult.pods);

			if (!pods || pods.error) throw "Couldn't find an answer to that question!";

			responseEmbed.fields.push({
				inline: false,
				name: '**Input Interpretation:**',
				value: pods[0].subpods[0].plaintext
			});

			let somethingReturned = false;

			const plot = pods.find(x => x.title.toLowerCase() === 'plot');
			const altForm = pods.find(x => x.title.toLowerCase() === 'alternate form');
			const result = pods.find(x => x.title.toLowerCase() === 'result');
			const decApprox = pods.find(x => x.title.toLowerCase() === 'decimal approximation');
			const decForm = pods.find(x => x.title.toLowerCase() === 'decimal form');

			if (plot) {
				responseEmbed.fields.push({
					inline: false,
					name: '**Alternate Form:**',
					value: altForm.subpods[0].plaintext.substring(0, 1500)
				});

				responseEmbed.setImage(plot.subpods[0].img.src);

				somethingReturned = true;
			}

			if (result) {
				responseEmbed.fields.push({
					inline: false,
					name: '**Result:**',
					value: result.subpods[0].plaintext.substring(0, 1500)
				});

				somethingReturned = true;
			}

			if (decApprox) {
				responseEmbed.fields.push({
					inline: false,
					name: '**Decimal Approximation:**',
					value: decApprox.subpods[0].plaintext.substring(0, 1500)
				});

				somethingReturned = true;
			}

			if (decForm) {
				responseEmbed.fields.push({
					inline: false,
					name: '**Decimal Form:**',
					value: decForm.subpods[0].plaintext.substring(0, 1500)
				});

				somethingReturned = true;
			}

			if (!somethingReturned) {
				throw `Couldn't interpret an answer to that question! Try looking manually?\nhttps://www.wolframalpha.com/input/?i=${encodeURIComponent(pods[0].subpods[0].plaintext)}`;
			}

			// Send the success response
			return msg.sendEmbed(responseEmbed);
		} catch (err) {
			msg.client.emit('warn', `Error in command ref:wolfram: ${err}`);

			return sendSimpleEmbeddedError(msg, err.startsWith('Couldn\'t interpret an answer to that question! Try looking manually?') ? err : 'There was an error with the request. Try again?');
		}
	}

}
