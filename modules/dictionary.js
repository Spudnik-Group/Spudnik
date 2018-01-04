const xml2js = require('xml2js');

module.exports = Spudnik => {
	const parser = new xml2js.Parser();
	return {
		commands: [
			'define'
		],
		define: {
			usage: '<word>',
			description: 'Looks up a word in the Merriam-Webster Collegiate Dictionary',
			process: (msg, suffix, isEdit, cb) => {
				const word = suffix;
				if (!word) {
					cb({
						embed: {
							color: Spudnik.Config.defaultEmbedColor,
							description: 'I won\'t define an empty string.'
						}
					}, msg);

					return;
				}

				require('request')(`http://www.dictionaryapi.com/api/v1/references/collegiate/xml/${word}?key=${Spudnik.Auth.dictionary_api_key}`, (err, res, body) => {
					let definitionResult = '';
					parser.parseString(body, (err, result) => {
						const wordList = result.entry_list.entry;
						let phonetic = '';
						phonetic += wordList[0].pr.map(entry => {
							if (typeof entry === 'object') {
								return entry._;
							}
							return entry;
						}).join('\n');
						definitionResult += `*[${phonetic}]*\n`;
						definitionResult += `Hear it: http://media.merriam-webster.com/soundc11/${wordList[0].sound[0].wav[0].slice(0, 1)}/${wordList[0].sound[0].wav[0]}\n\n`;
						wordList.forEach(wordResult => {
							let defList = '';
							let defArray = wordResult.def[0].dt;
							if (wordResult.ew[0] !== word) {
								return;
							}
							definitionResult += '__' + wordResult.fl[0] + '__\n';
							defArray = defArray.filter(item => {
								if (typeof item === 'object') {
									item._ = item._.trim();
									return item._ !== ':';
								}
								item = item.trim();
								return item !== ':';
							});
							defList += defArray.map(entry => {
								if (typeof entry === 'object') {
									return entry._;
								}
								return entry;
							}).join('\n');
							definitionResult += `${defList}\n\n`;
						});

						cb({
							embed: {
								color: Spudnik.Config.defaultEmbedColor,
								title: word,
								description: definitionResult,
								footer: {
									text: 'powered by Merriam-Webster\'s Collegiate® Dictionary',
									icon_url: 'http://www.dictionaryapi.com/images/info/branding-guidelines/mw-logo-light-background-50x50.png'
								}
							}
						}, msg);
					});
				});
			}
		}
	};
};
