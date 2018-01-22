import chalk from 'chalk';
import { Message, RichEmbed } from 'discord.js';
import { RequestResponse } from 'request';
import * as request from 'request';
import factsData = require('../extras/data.js');
import { Spudnik } from '../spudnik';

const randomInt = (a: number, b?: number) => {
	let min;
	let max;
	if (a === null) {
		a = 1;
	}
	if (b === null || b === undefined) {
		b = 1;
	}

	if (a === b) {
		return -1;
	} else if (a < b) {
		max = b;
		min = a;
	} else {
		max = a;
		min = b;
	}

	return Math.floor(Math.random() * (max - min + 1)) + min;
};

const randomItem = (collection: any[]) => {
	if (!Array.isArray(collection) || collection.length < 1) {
		return null;
	}

	return collection[randomInt(collection.length) - 1];
};

module.exports = (Spudnik: Spudnik) => {
	// tslint:disable:object-literal-sort-keys
	const commandObject: any = {
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
			'coinflip',
		],
		math_fact: {
			usage: '<random math>',
			description: 'Gives a Random Math Fact',
			process: (msg: Message, suffix: string) => {
				request('http://numbersapi.com/random/math?json', (err: Error, res: RequestResponse, body: string) => {
					try {
						if (err) {
							throw err;
						}

						const data = JSON.parse(body);
						if (data && data.text) {
							return Spudnik.processMessage(new RichEmbed({
								color: Spudnik.Config.getDefaultEmbedColor(),
								title: 'Math Fact',
								description: data.text,
							}), msg, false, false);
						}
					} catch (err) {
						let msgTxt = 'command math_fact failed :disappointed_relieved:';
						if (Spudnik.Config.getDebug()) {
							msgTxt += `\n${err.stack}`;
							console.log(chalk.red(err));
						}
						return Spudnik.processMessage(msgTxt, msg, false, false);
					}
				});
			},
		},
		year_fact: {
			description: 'Gives a Random Year Fact',
			process: (msg: Message, suffix: string) => {
				request('http://numbersapi.com/random/year?json', (err: Error, res: RequestResponse, body: string) => {
					try {
						if (err) {
							throw err;
						}

						const data = JSON.parse(body);
						if (data && data.text) {
							return Spudnik.processMessage(new RichEmbed({
								color: Spudnik.Config.getDefaultEmbedColor(),
								title: 'Year Fact',
								description: data.text,
							}), msg, false, false);
						}
					} catch (err) {
						let msgTxt = 'command year_fact failed :disappointed_relieved:';
						if (Spudnik.Config.getDebug()) {
							msgTxt += `\n${err.stack}`;
							console.log(chalk.red(err));
						}
						return Spudnik.processMessage(msgTxt, msg, false, false);
					}
				});
			},
		},
		date_fact: {
			description: 'Gives a Random Date Fact',
			process: (msg: Message, suffix: string) => {
				request('http://numbersapi.com/random/date?json', (err: Error, res: RequestResponse, body: string) => {
					try {
						if (err) {
							throw err;
						}

						const data = JSON.parse(body);
						if (data && data.text) {
							Spudnik.processMessage(new RichEmbed({
								color: Spudnik.Config.getDefaultEmbedColor(),
								title: 'Date Fact',
								description: data.text,
							}), msg, false, false);
						}
					} catch (err) {
						let msgTxt = 'command date_fact failed :disappointed_relieved:';
						if (Spudnik.Config.getDebug()) {
							msgTxt += `\n${err.stack}`;
							console.log(chalk.red(err));
						}
						Spudnik.processMessage(msgTxt, msg, false, false);
					}
				});
			},
		},
		chucknorris: {
			description: 'Gives a Random Chuck Norris Joke',
			process: (msg: Message, suffix: string) => {
				request('http://api.icndb.com/jokes/random', (err: Error, res: RequestResponse, body: string) => {
					try {
						if (err) {
							throw err;
						}

						const data = JSON.parse(body);
						if (data && data.value && data.value.joke) {
							Spudnik.processMessage(new RichEmbed({
								color: Spudnik.Config.getDefaultEmbedColor(),
								title: 'Math Fact',
								description: data.value.joke,
							}), msg, false, false);
						}
					} catch (err) {
						let msgTxt = 'command chucknorris failed :disappointed_relieved:';
						if (Spudnik.Config.getDebug()) {
							msgTxt += `\n${err.stack}`;
							console.log(chalk.red(err));
						}
						Spudnik.processMessage(msgTxt, msg, false, false);
					}
				});
			},
		},
		cat_fact: {
			description: 'Gives a Random Cat Fact',
			process: (msg: Message, suffix: string) => {
				request('https://catfact.ninja/fact', (err: Error, res: RequestResponse, body: string) => {
					try {
						if (err) {
							throw err;
						}

						const data = JSON.parse(body);
						if (data && data.fact) {
							Spudnik.processMessage(new RichEmbed({
								color: Spudnik.Config.getDefaultEmbedColor(),
								title: 'Cat Fact',
								description: data.fact,
							}), msg, false, false);
						}
					} catch (err) {
						let msgTxt = 'command cat_fact failed :disappointed_relieved:';
						if (Spudnik.Config.getDebug()) {
							msgTxt += `\n${err.stack}`;
							console.log(chalk.red(err));
						}
						Spudnik.processMessage(msgTxt, msg, false, false);
					}
				});
			},
		},
		dog_fact: {
			description: 'Gives a Random Dog Fact',
			process: (msg: Message, suffix: string) => {
				request('https://dog-api.kinduff.com/api/facts', (err: Error, res: RequestResponse, body: string) => {
					try {
						if (err) {
							throw err;
						}

						const data = JSON.parse(body);
						if (data && data.facts && data.facts[0]) {
							Spudnik.processMessage(new RichEmbed({
								color: Spudnik.Config.getDefaultEmbedColor(),
								title: 'Dog Fact',
								description: data.facts[0],
							}), msg, false, false);
						}
					} catch (err) {
						let msgTxt = 'command dog_fact failed :disappointed_relieved:';
						if (Spudnik.Config.getDebug()) {
							msgTxt += `\n${err.stack}`;
							console.log(chalk.red(err));
						}
						Spudnik.processMessage(msgTxt, msg, false, false);
					}
				});
			},
		},
		bacon: {
			description: 'Gives You Bacon; Bacon Makes Everything Better...',
			process: (msg: Message, suffix: string) => {
				Spudnik.processMessage(new RichEmbed({
					image: {
						url: randomItem(factsData.bacon),
					},
				}), msg, false, false);
			},
		},
		smifffact: {
			description: 'Blesses you with a fact about Will Smith.',
			process: (msg: Message, suffix: string) => {
				Spudnik.processMessage(new RichEmbed({
					color: Spudnik.Config.getDefaultEmbedColor(),
					title: 'Will Smith Fact',
					description: randomItem(factsData.smiff),
				}), msg, false, false);
			},
		},
		gitgud: {
			usage: '<someone (optional)>',
			description: 'Tell someone (or everyone) to git gud.',
			process: (msg: Message, suffix: string) => {
				Spudnik.processMessage({
					reply: Spudnik.resolveMention(suffix),
					embed: { image: { url: 'http://i.imgur.com/NqpPXHu.jpg' } },
				}, msg, false, false);
			},
		},
		choose: {
			usage: '<Choices (comma seperated)>',
			description: 'Let the bot choose for you.',
			process: (msg: Message, suffix: string) => {
				let response = 'Sounds like you\'re out of options.';
				if (suffix) {
					const options = suffix.split(',');
					response = `I choose ${randomItem(options)}`;
				}

				Spudnik.processMessage(new RichEmbed({
					color: Spudnik.Config.getDefaultEmbedColor(),
					title: `:thinking: **${response}**`,
				}), msg, false, false);
			},
		},
		coinflip: {
			description: 'Let the bot flip a coin for you.',
			process: (msg: Message, suffix: string) => {
				let img = null;
				let response = 'I can\'t find my coin!';
				const flipResult = randomItem(factsData.coinflip);
				if (flipResult !== null) {
					response = '';
					img = flipResult.image;
				}

				Spudnik.processMessage(new RichEmbed({
					color: Spudnik.Config.getDefaultEmbedColor(),
					title: response,
					thumbnail: {
						url: img,
					},
				}), msg, false, false);
			},
		},
	};

	commandObject['8ball'] = {
		usage: '<Question>',
		description: 'Ask the magic 8 ball a question.',
		process: (msg: Message, suffix: string) => {
			let response = 'Not even I have an answer to a question not asked.';
			if (suffix) {
				response = 'I don\'t know what to tell you. I\'m all out of answers.';
				if (factsData.eightBall && factsData.eightBall.length > 0) {
					response = randomItem(factsData.eightBall);
				}
			}

			Spudnik.processMessage(new RichEmbed({
				color: Spudnik.Config.getDefaultEmbedColor(),
				title: suffix,
				description: `:8ball: **${response}**`,
			}), msg, false, false);
		},
	};

	return commandObject;
};
