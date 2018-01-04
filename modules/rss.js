const FeedParser = require('feedparser');
const request = require('request');

module.exports = Spudnik => {
	const feedparser = new FeedParser();
	const rssFeeds = Spudnik.getJsonObject('/config/rss.json');
	const returnObject = {
		commands: ['rss'],
		rss: {
			description: 'Lists Available RSS Feeds',
			process: (msg, suffix, isEdit, cb) => {
				let output = '';
				for (const c in rssFeeds) {
					output += `${c}: ${rssFeeds[c].url}\n`;
				}
				cb(`Available feeds:\n${output}`, msg);
			}
		}
	};
	function loadFeeds() {
		for (const cmd in rssFeeds) {
			returnObject.commands.push(cmd);
			returnObject[cmd] = {
				usage: '[count]',
				description: rssFeeds[cmd].description,
				url: rssFeeds[cmd].url,
				process: (msg, suffix, isEdit, cb) => {
					let count = 1;
					if (suffix !== null && suffix !== '' && !isNaN(suffix)) {
						count = suffix;
					}
					rssfeed(msg, this.url, count, cb);
				}
			};
		}
	}
	function rssfeed(msg, url, count, cb) {
		request(url).pipe(feedparser);
		feedparser.on('error', error => {
			cb(`Failed reading feed: ${error}`, msg);
		});
		let shown = 0;
		feedparser.on('readable', function () {
			const stream = this;
			shown += 1;
			if (shown > count) {
				return;
			}
			const item = stream.read();
			cb(`${item.title} ${item.link}`, msg);
			stream.alreadyRead = true;
		});
	}

	loadFeeds();

	return returnObject;
};
