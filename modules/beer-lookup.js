module.exports = Spudnik => {
	return {
		commands: [
			'brew'
		],
		brew: {
			usage: '[brew | brewery]',
			type: 'normal',
			description: 'Used to retrieve specific information about a brewery or brew.',
			process: (msg, suffix, isEdit, cb) => {
				const brewEmbed = {
					embed: {
						color: Spudnik.Config.defaultEmbedColor,
						author: {
							name: 'BreweryDB',
							url: 'http://www.brewerydb.com/',
							icon_url: 'https://emojipedia-us.s3.amazonaws.com/thumbs/120/twitter/103/beer-mug_1f37a.png'
						},
						footer: {
							text: 'powered by BreweryDB',
							icon_url: 'http://s3.amazonaws.com/brewerydb/Powered-By-BreweryDB.png'
						},
						description: 'How about asking for something specific?'
					}
				};

				if (suffix) {
					require('request')(`http://api.brewerydb.com/v2/search?q=${encodeURIComponent(suffix)}&key=${Spudnik.Auth.brewerydb_api_key}`, (err, res, body) => {
						if (err !== 'undefined' && err !== null) {
							brewEmbed.embed.description = 'Service unavailable!';
						} else if (typeof body !== 'undefined') {
							const response = JSON.parse(body);
							const result = response.data[0];
							if (typeof result.description !== 'undefined') {
								const fields = [];
								let thumbnail = '';
								if (typeof result.labels !== 'undefined') {
									thumbnail = result.labels.medium;
								}

								if (typeof result.images !== 'undefined') {
									thumbnail = result.images.squareMedium;
								}

								if (typeof result.style !== 'undefined') {
									fields.push({
										name: `Style: ${result.style.name}`,
										value: result.style.description
									});
								}
								if (typeof result.abv !== 'undefined') {
									fields.push({
										name: 'ABV (Alcohol By Volume)',
										value: `${result.abv}%`,
										inline: true
									});
								}
								if (typeof result.ibu !== 'undefined') {
									fields.push({
										name: 'IBU (International Bitterness Units)',
										value: `${result.ibu}/100`,
										inline: true
									});
								}

								if (typeof result.website !== 'undefined') {
									fields.push({
										name: 'Website',
										value: result.website,
										inline: true
									});
								}

								if (typeof result.established !== 'undefined') {
									fields.push({
										name: 'Year Established',
										value: result.established,
										inline: true
									});
								}

								if (fields !== []) {
									brewEmbed.embed.fields = fields;
								}
								if (thumbnail !== '') {
									brewEmbed.embed.thumbnail = {
										url: thumbnail
									};
								}
								brewEmbed.embed.description = `\n${result.description}\n\n`;
							} else {
								brewEmbed.embed.description = `${response.data[0].name} is a good beer, but I don't have a good way to describe it.`;
							}
						} else {
							brewEmbed.embed.description = `Damn, I've never heard of that. Where do I need to go to find it?`;
						}
						cb(brewEmbed, msg);
					});
				} else {
					cb(brewEmbed, msg);
				}
			}
		}
	};
};
