const Wiki = require('wikijs').default;

module.exports = Spudnik => {
	return {
		commands: [
			'wiki'
		],
		wiki: {
			usage: '<search terms>',
			description: 'Returns the summary of the first matching search result from Wikipedia',
			process: (msg, suffix, isEdit, cb) => {
				const query = suffix;
				if (!query) {
					cb(`Usage: ${Spudnik.Config.commandPrefix}wiki search terms`, msg);
					return;
				}

				new Wiki().search(query, 1).then(data => {
					new Wiki().page(data.results[0]).then(page => {
						page.summary().then(summary => {
							const sumText = summary.toString().split('\n');
							const continuation = function () {
								const paragraph = sumText.shift();
								if (paragraph) {
									cb({
										embed: {
											color: Spudnik.Config.defaultEmbedColor,
											title: page.title,
											description: `${paragraph}\n\n${page.fullurl}`
										}
									}, msg);
								}
							};
							continuation();
						});
					});
				}, err => {
					cb(err, msg);
				});
			}
		}
	};
};
