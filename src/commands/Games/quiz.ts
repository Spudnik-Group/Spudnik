import { stripIndents } from 'common-tags';
import { list, shuffle } from '../../lib/helpers';
import axios from 'axios';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';
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
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['jeopardy'],
			args: [
				{
					default: 'multiple',
					key: 'type',
					oneOf: types,
					parse: (type: any) => type.toLowerCase(),
					prompt: `Which type of question would you like to have? Either ${list(types, 'or')}.`,
					type: 'string'
				},
				{
					default: '',
					key: 'difficulty',
					oneOf: difficulties,
					parse: (difficulty: any) => difficulty.toLowerCase(),
					prompt: `What should the difficulty of the game be? Either ${list(difficulties, 'or')}.`,
					type: 'string'
				}
			],
			description: 'Answer a quiz question.',
			details: stripIndents`
				syntax: \`!quiz (quizType) (difficulty)\`
				**Types**: ${types.join(', ')}
				**Difficulties**: ${difficulties.join(', ')}
			`,
			examples: ['!quiz boolean easy', '!quiz'],
			group: 'game',
			guildOnly: true,
			memberName: 'quiz',
			name: 'quiz'
		});

	}

	/**
	 * Run the "Quiz" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof QuizCommand
	 */
	public async run(msg: KlasaMessage, args: { type: string, difficulty: string }): Promise<KlasaMessage | KlasaMessage[]> {
		try {
			const { data: body } = await axios.get('https://opentdb.com/api.php', {
				params: {
					amount: 1,
					difficulty: args.difficulty,
					encode: 'url3986',
					type: args.type
				}
			});
			if (!body.results) { return msg.sendMessage('Oh no, a question could not be fetched. Try again later!', { reply: msg.author }); }
			const answers = body.results[0].incorrect_answers.map((answer: string) => decodeURIComponent(answer.toLowerCase()));
			const correct = decodeURIComponent(body.results[0].correct_answer.toLowerCase());
			answers.push(correct);
			const shuffled = shuffle(answers);
			await msg.reply(stripIndents`
				**You have 15 seconds to answer this question.**
				${decodeURIComponent(body.results[0].question)}
				${shuffled.map((answer: string, i: any) => `**${choices[i]}**. ${answer}`).join('\n')}
			`);
			const filter = (res: any) => res.author.id === msg.author.id && choices.includes(res.content.toUpperCase());
			const msgs: any = await msg.channel.awaitMessages(filter, {
				max: 1,
				time: 15000
			});
			if (!msgs.size) { return msg.sendMessage(`Sorry, time is up! It was ${correct}.`, { reply: msg.author }); }
			const win = shuffled[choices.indexOf(msgs.first().content.toUpperCase())] === correct;
			if (!win) { return msg.sendMessage(`Nope, sorry, it's ${correct}.`, { reply: msg.author }); }

			return msg.sendMessage('Nice job! 10/10! You deserve some cake!', { reply: msg.author });
		} catch (err) {
			return msg.sendMessage(`Oh no, an error occurred: \`${err.message}\`. Try again later!`, { reply: msg.author });
		}
	}
}
