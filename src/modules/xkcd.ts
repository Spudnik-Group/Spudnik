import { Message, RichEmbed } from 'discord.js';
import * as request from 'request';
import { RequestResponse } from 'request';
import { Spudnik } from '../spudnik';

module.exports = (Spudnik: Spudnik) => {
	return {
		commands: [
			'highnoon',
			'xkcd',
		],
		// tslint:disable:object-literal-sort-keys
		xkcd: {
			usage: '[comic number]',
			description: 'Displays a given XKCD comic number (or the latest if nothing specified',
			process: (msg: Message, suffix: string) => {
				let url: string = 'http://xkcd.com/';
				if (suffix !== '') {
					url += `${suffix}/`;
				}
				url += 'info.0.json';
				request({ url }, (err: Error, res: RequestResponse, body: string) => {
					try {
						const comic = JSON.parse(body);
						Spudnik.processMessage(new RichEmbed({
							color: Spudnik.Config.getDefaultEmbedColor(),
							title: `XKCD ${comic.num} ${comic.title}`,
							image: {
								url: comic.img,
							},
							footer: {
								text: comic.alt,
							},
						}), msg, false, false);
					} catch (err) {
						Spudnik.processMessage(`Couldn't fetch an XKCD for ${suffix}`, msg, false, false);
					}
				});
			},
		},
		highnoon: {
			process: (msg: Message, suffix: string) => {
				request({
					uri: 'http://imgs.xkcd.com/comics/now.png',
					followAllRedirects: true,
				}, (err: Error, resp: RequestResponse) => {
					if (resp.request.uri.href) {
						Spudnik.processMessage(new RichEmbed({
							color: Spudnik.Config.getDefaultEmbedColor(),
							image: {
								url: resp.request.uri.href.toString(),
							},
						}), msg, false, false);
					}
				});
			},
		},
	};
};
