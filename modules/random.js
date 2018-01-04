const chalk = require('chalk');
const request = require('request');
const factsData = require('../extras/data.js');

const randomInt = (a, b) => {
	let min;
	let max;
	if (a === null || isNaN(parseInt(a, 10))) {
		a = 1;
	}
	if (b === null || isNaN(parseInt(b, 10))) {
		b = 1;
	}

	if (a === b) {
		return -1;
	} else if (a < b) {
		max = parseInt(b, 10);
		min = parseInt(a, 10);
	} else {
		max = parseInt(a, 10);
		min = parseInt(b, 10);
	}

	return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomItem = collection => {
	if (!Array.isArray(collection) || collection.length < 1) {
		return null;
	}

	return collection[randomInt(collection.length) - 1];
};

module.exports = function (Spudnik) {
	const commandObject = {
		commands: [
			'date_fact',
			'year_fact',
			'math_fact',
			'chucknorris',
			'cat_fact',
			'dog_fact',
			'bacon',
			'smifffact',
			'gitgud',
			'8ball',
			'choose',
			'coinflip'
		],
		math_fact: {
			usage: '<random math>',
			description: 'Gives a Random Math Fact',
			process: (msg, suffix, isEdit, cb) => {
				request('http://numbersapi.com/random/math?json', (err, res, body) => {
					try {
						if (err) {
							throw err;
						}

						const data = JSON.parse(body);
						if (data && data.text) {
							cb({
								embed: {
									color: Spudnik.Config.defaultEmbedColor,
									title: 'Math Fact',
									description: data.text
								}
							}, msg);
						}
					} catch (err) {
						let msgTxt = `command math_fact failed :disappointed_relieved:`;
						if (Spudnik.Config.debug) {
							msgTxt += `\n${err.stack}`;
							console.log(chalk.red(err));
						}
						cb(msgTxt, msg);
					}
				});
			}
		},
		year_fact: {
			description: 'Gives a Random Year Fact',
			process: (msg, suffix, isEdit, cb) => {
				request('http://numbersapi.com/random/year?json', (err, res, body) => {
					try {
						if (err) {
							throw err;
						}

						const data = JSON.parse(body);
						if (data && data.text) {
							cb({
								embed: {
									color: Spudnik.Config.defaultEmbedColor,
									title: 'Year Fact',
									description: data.text
								}
							}, msg);
						}
					} catch (err) {
						let msgTxt = `command year_fact failed :disappointed_relieved:`;
						if (Spudnik.Config.debug) {
							msgTxt += `\n${err.stack}`;
							console.log(chalk.red(err));
						}
						cb(msgTxt, msg);
					}
				});
			}
		},
		date_fact: {
			description: 'Gives a Random Date Fact',
			process: (msg, suffix, isEdit, cb) => {
				request('http://numbersapi.com/random/date?json', (err, res, body) => {
					try {
						if (err) {
							throw err;
						}

						const data = JSON.parse(body);
						if (data && data.text) {
							cb({
								embed: {
									color: Spudnik.Config.defaultEmbedColor,
									title: 'Date Fact',
									description: data.text
								}
							}, msg);
						}
					} catch (err) {
						let msgTxt = `command date_fact failed :disappointed_relieved:`;
						if (Spudnik.Config.debug) {
							msgTxt += `\n${err.stack}`;
							console.log(chalk.red(err));
						}
						cb(msgTxt, msg);
					}
				});
			}
		},
		chucknorris: {
			description: 'Gives a Random Chuck Norris Joke',
			process: (msg, suffix, isEdit, cb) => {
				request('http://api.icndb.com/jokes/random', (err, res, body) => {
					try {
						if (err) {
							throw err;
						}

						const data = JSON.parse(body);
						if (data && data.value && data.value.joke) {
							cb({
								embed: {
									color: Spudnik.Config.defaultEmbedColor,
									title: 'Math Fact',
									description: data.value.joke
								}
							}, msg);
						}
					} catch (err) {
						let msgTxt = `command chucknorris failed :disappointed_relieved:`;
						if (Spudnik.Config.debug) {
							msgTxt += `\n${err.stack}`;
							console.log(chalk.red(err));
						}
						cb(msgTxt, msg);
					}
				});
			}
		},
		cat_fact: {
			description: 'Gives a Random Cat Fact',
			process: (msg, suffix, isEdit, cb) => {
				request('https://catfact.ninja/fact', (err, res, body) => {
					try {
						if (err) {
							throw err;
						}

						const data = JSON.parse(body);
						if (data && data.fact) {
							cb({
								embed: {
									color: Spudnik.Config.defaultEmbedColor,
									title: 'Cat Fact',
									description: data.fact
								}
							}, msg);
						}
					} catch (err) {
						let msgTxt = `command cat_fact failed :disappointed_relieved:`;
						if (Spudnik.Config.debug) {
							msgTxt += `\n${err.stack}`;
							console.log(chalk.red(err));
						}
						cb(msgTxt, msg);
					}
				});
			}
		},
		dog_fact: {
			description: 'Gives a Random Dog Fact',
			process: (msg, suffix, isEdit, cb) => {
				request('https://dog-api.kinduff.com/api/facts', (err, res, body) => {
					try {
						if (err) {
							throw err;
						}

						const data = JSON.parse(body);
						if (data && data.facts && data.facts[0]) {
							cb({
								embed: {
									color: Spudnik.Config.defaultEmbedColor,
									title: 'Dog Fact',
									description: data.facts[0]
								}
							}, msg);
						}
					} catch (err) {
						let msgTxt = `command dog_fact failed :disappointed_relieved:`;
						if (Spudnik.Config.debug) {
							msgTxt += `\n${err.stack}`;
							console.log(chalk.red(err));
						}
						cb(msgTxt, msg);
					}
				});
			}
		},
		bacon: {
			description: 'Gives You Bacon; Bacon Makes Everything Better...',
			process: (msg, suffix, isEdit, cb) => {
				cb({
					embed: {
						image: {
							url: randomItem(factsData.bacon)
						}
					}
				}, msg);
			}
		},
		smifffact: {
			description: 'Blesses you with a fact about Will Smith.',
			process: (msg, suffix, isEdit, cb) => {
				cb({
					embed: {
						color: Spudnik.Config.defaultEmbedColor,
						title: 'Will Smith Fact',
						description: randomItem(factsData.smiff)
					}
				}, msg);
			}
		},
		gitgud: {
			usage: '<someone (optional)>',
			description: 'Tell someone (or everyone) to git gud.',
			process: (msg, suffix, isEdit, cb) => {
				cb({
					reply: Spudnik.resolveMention(suffix),
					embed: { image: { url: 'http://i.imgur.com/NqpPXHu.jpg' } }
				}, msg);
			}
		},
		choose: {
			usage: '<Choices (comma seperated)>',
			description: 'Let the bot choose for you.',
			process: (msg, suffix, isEdit, cb) => {
				let response = 'Sounds like you\'re out of options.';
				if (suffix) {
					const options = suffix.split(',');
					response = `I choose ${randomItem(options)}`;
				}

				cb({
					embed: {
						color: Spudnik.Config.defaultEmbedColor,
						title: `:thinking: **${response}**`
					}
				}, msg);
			}
		},
		coinflip: {
			description: 'Let the bot flip a coin for you.',
			process: (msg, suffix, isEdit, cb) => {
				let img = null;
				let response = 'I can\'t find my coin!';
				const flipResult = randomItem(factsData.coinflip);
				if (flipResult !== null) {
					response = null;
					img = flipResult.image;
				}

				cb({
					embed: {
						color: Spudnik.Config.defaultEmbedColor,
						title: response,
						thumbnail: {
							url: img
						}
					}
				}, msg);
			}
		}
	};

	commandObject['8ball'] = {
		usage: '<Question>',
		description: 'Ask the magic 8 ball a question.',
		process: (msg, suffix, isEdit, cb) => {
			let response = 'Not even I have an answer to a question not asked.';
			if (suffix) {
				response = 'I don\'t know what to tell you. I\'m all out of answers.';
				if (factsData.eightBall && factsData.eightBall.length > 0) {
					response = randomItem(factsData.eightBall);
				}
			}

			cb({
				embed: {
					color: Spudnik.Config.defaultEmbedColor,
					title: suffix,
					description: `:8ball: **${response}**`
				}
			}, msg);
		}
	};

	return commandObject;
};
