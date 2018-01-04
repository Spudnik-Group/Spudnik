module.exports = Spudnik => {
	return {
		commands: [
			'xkcd',
			'highnoon'
		],
		xkcd: {
			usage: '[comic number]',
			description: 'Displays a given XKCD comic number (or the latest if nothing specified',
			process: (msg, suffix, isEdit, cb) => {
				let url = 'http://xkcd.com/';
				if (suffix !== '') {
					url += `${suffix}/`;
				}
				url += 'info.0.json';
				require('request')(url, (err, res, body) => {
					try {
						const comic = JSON.parse(body);
						cb({
							embed: {
								color: Spudnik.Config.defaultEmbedColor,
								title: `XKCD ${comic.num} ${comic.title}`,
								image: {
									url: comic.img
								},
								footer: {
									text: comic.alt
								}
							}
						}, msg);
					} catch (err) {
						cb(`Couldn't fetch an XKCD for ${suffix}`, msg);
					}
				});
			}
		},
		highnoon: {
			process: (msg, suffix, isEdit, cb) => {
				require('request')({
					uri: 'http://imgs.xkcd.com/comics/now.png',
					followAllRedirects: true
				}, (err, resp) => cb({ embed: { image: { url: resp.request.uri.href } } }, msg));
			}
		}
	};
};
