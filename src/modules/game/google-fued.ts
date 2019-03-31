import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
//tslint:disable-next-line
const questions = require('../../extras/google-feud');

/**
 * Starts a game of Google Feud.
 *
 * @export
 * @class GoogleFeudCommand
 * @extends {Command}
 */
export default class GoogleFeudCommand extends Command {
	private playing = new Set();

	/**
	 * Creates an instance of GoogleFeudCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof GoogleFeudCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					default: () => questions[Math.floor(Math.random() * questions.length)],
					key: 'question',
					prompt: 'What question do you want to use for the game?',
					type: 'string'
				}
			],
			description: 'Attempt to determine the top suggestions for a Google search.',
			details: 'syntax: \`!google-feud (question)\`',
			examples: ['!google-feud', '!google-feud what happens if'],
			group: 'game',
			guildOnly: true,
			memberName: 'google-feud',
			name: 'google-feud'
		});

	}

	/**
	 * Run the "GoogleFeud" command.
	 *
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof GoogleFeudCommand
	 */
	public async run(msg: CommandoMessage, args: { question: string }): Promise<Message | Message[]> {
		if (this.playing.has(msg.channel.id)) { return msg.reply('Only one fight may be occurring per channel.'); }
		this.playing.add(msg.channel.id);
		try {
			const suggestions = await this.fetchSuggestions(args.question);
			if (!suggestions) { return msg.say('Could not find any results.'); }
			const display = new Array(suggestions.length).fill('???');
			let tries = 3;
			while (display.includes('???') && tries) {
				const embed = new MessageEmbed()
					.setColor(0x005AF0)
					.setTitle(`${args.question}...?`)
					.setDescription('Type the choice you think is a suggestion _without_ the question.')
					.setFooter(`${tries} ${tries === 1 ? 'try' : 'tries'} remaining!`);
				for (let i = 0; i < suggestions.length; i++) { embed.addField(`❯ ${10000 - (i * 1000)}`, display[i], true); }
				await msg.embed(embed);
				const msgs: any = await msg.channel.awaitMessages((res) => res.author.id === msg.author.id, {
					max: 1,
					time: 30000
				});
				if (!msgs.size) {
					await msg.say('Time is up!');
					break;
				}
				const choice = msgs.first().content.toLowerCase();
				if (suggestions.includes(choice)) {
					display[suggestions.indexOf(choice)] = choice;
				} else {
					--tries;
				}
			}
			this.playing.delete(msg.channel.id);
			if (!display.includes('???')) { return msg.say('You win! Nice job, master of Google!'); }
			return msg.say('Better luck next time!');
		} catch (err) {
			this.playing.delete(msg.channel.id);
			return msg.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}

	private async fetchSuggestions(question: any) {
		const { text } = await require('node-superfetch')
			.get('https://suggestqueries.google.com/complete/search')
			.query({
				client: 'firefox',
				q: question
			});
		const suggestions = JSON.parse(text)[1]
			.filter((suggestion: any) => suggestion.toLowerCase() !== question.toLowerCase());
		if (!suggestions.length) { return null; }
		return suggestions.map((suggestion: any) => suggestion.toLowerCase().replace(question.toLowerCase(), '').trim());
	}
}
