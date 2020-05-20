/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import axios from 'axios';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import { list, shuffle } from '@lib/utils/util';

const types: string[] = ['multiple', 'boolean'];
const difficulties: string[] = ['easy', 'medium', 'hard'];
const choices: string[] = ['A', 'B', 'C', 'D'];

/**
 * Starts a game of Quiz.
 *
 * @export
 * @class QuizCommand
 * @extends {Command}
 */
export default class QuizCommand extends Command {

	/**
	 * Creates an instance of QuizCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof QuizCommand
	 */
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['jeopardy'],
			description: 'Answer a quiz question.',
			extendedHelp: stripIndents`
				**Types**: ${types.join(', ')}
				**Difficulties**: ${difficulties.join(', ')}
			`,
			usage: '(type:type) (difficulty:difficulty)'
		});

		this
			.createCustomResolver('type', (arg: string) => {
				if (types.includes(arg.toLowerCase())) return arg;
				throw `Please provide a valid quiz type. Options are: ${list(types, 'or')}.`;
			})
			.createCustomResolver('difficulty', (arg: string) => {
				if (difficulties.includes(arg.toLowerCase())) return arg;
				throw `Please provide a valid difficulty level. Options are: ${list(difficulties, 'or')}.`;
			});
	}

	/**
	 * Run the "Quiz" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof QuizCommand
	 */
	public async run(msg: KlasaMessage, [type, difficulty]: [string, string]): Promise<KlasaMessage | KlasaMessage[]> {
		try {
			const { data: body } = await axios.get('https://opentdb.com/api.php', {
				params: {
					amount: 1,
					difficulty,
					encode: 'url3986',
					type
				}
			});
			if (!body.results) return msg.sendSimpleEmbedReply('Oh no, a question could not be fetched. Try again later!');
			const answers = body.results[0].incorrect_answers.map((answer: string) => decodeURIComponent(answer.toLowerCase()));
			const correct = decodeURIComponent(body.results[0].correct_answer.toLowerCase());
			answers.push(correct);
			const shuffled = shuffle(answers);
			await msg.reply(stripIndents`
				**You have 15 seconds to answer this question.**
				${decodeURIComponent(body.results[0].question)}
				${shuffled.map((answer: string, i: any) => `**${choices[i]}**. ${answer}`).join('\n')}
			`);
			const filter = (res: any): boolean => res.author.id === msg.author.id && choices.includes(res.content.toUpperCase());
			const msgs: any = await msg.channel.awaitMessages(filter, {
				max: 1,
				time: 15000
			});
			if (!msgs.size) return msg.sendSimpleEmbedReply(`Sorry, time is up! It was ${correct}.`);
			const win = shuffled[choices.indexOf(msgs.first().content.toUpperCase())] === correct;
			if (!win) return msg.sendSimpleEmbedReply(`Nope, sorry, it's ${correct}.`);

			return msg.sendSimpleEmbedReply('Nice job! 10/10! You deserve some cake!');
		} catch (err) {
			return msg.sendSimpleEmbedReply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}

}
