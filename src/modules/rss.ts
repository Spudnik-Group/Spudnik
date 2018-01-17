import { Message } from 'discord.js';
import * as request from 'request';
import { Spudnik } from '../spudnik';

//tslint:disable-next-line
const FeedParser = require('feedparser');

module.exports = (Spudnik: Spudnik) => {
	const feedparser = new FeedParser();
	const rssFeeds = Spudnik.getJsonObject('/config/rss.json');
	const returnObject: any = {
		// tslint:disable:object-literal-sort-keys
		commands: ['rss'],
		rss: {
			description: 'Lists Available RSS Feeds',
			process: (msg: Message, suffix: string) => {
				let output = '';
				for (const c in rssFeeds) {
					output += `${c}: ${rssFeeds[c].url}\n`;
				}
				Spudnik.processMessage(`Available feeds:\n${output}`, msg, false, false);
			},
		},
	};
	function loadFeeds() {
		for (const cmd in rssFeeds) {
			returnObject.commands.push(cmd);
			returnObject[cmd] = {
				usage: '[count]',
				description: rssFeeds[cmd].description,
				url: rssFeeds[cmd].url,
				process: (msg: Message, suffix: number) => {
					let count = 1;
					if (suffix !== null && !isNaN(suffix)) {
						count = suffix;
					}
					rssfeed(msg, rssFeeds[cmd].url, count);
				},
			};
		}
	}
	function rssfeed(msg: Message, url: string, count: number) {
		request(url).pipe(feedparser);
		feedparser.on('error', (error: Error) => {
			Spudnik.processMessage(`Failed reading feed: ${error}`, msg, false, false);
		});
		let shown = 0;
		feedparser.on('readable', (stream: any) => {
			shown += 1;
			if (shown > count) {
				return;
			}
			const item = stream.read();
			Spudnik.processMessage(`${item.title} ${item.link}`, msg, false, false);
			stream.alreadyRead = true;
		});
	}

	loadFeeds();

	return returnObject;
};
