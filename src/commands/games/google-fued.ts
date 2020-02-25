/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, KlasaMessage } from 'klasa';
import { MessageEmbed } from 'discord.js';

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
	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Attempt to determine the top suggestions for a Google search.',
			extendedHelp: 'syntax: \`!google-feud (question)\`',
			name: 'google-feud',
			usage: '<question:...string>'
		});

		this.createCustomResolver('question', arg => arg ? arg : questions[Math.floor(Math.random() * questions.length)]);
	}

	/**
	 * Run the "GoogleFeud" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof GoogleFeudCommand
	 */
	public async run(msg: KlasaMessage, [question]): Promise<KlasaMessage | KlasaMessage[]> {
		if (this.playing.has(msg.channel.id)) { return msg.sendMessage('Only one fight may be occurring per channel.', { reply: msg.author }); }
		this.playing.add(msg.channel.id);

		try {
			const suggestions = await this.fetchSuggestions(question);

			if (!suggestions) { return msg.sendMessage('Could not find any results.'); }

			const display = new Array(suggestions.length).fill('???');
			let tries = 3;

			while (display.includes('???') && tries) {
				const embed = new MessageEmbed()
					.setColor(0x005AF0)
					.setTitle(`${question}...?`)
					.setDescription('Type the choice you think is a suggestion _without_ the question.')
					.setFooter(`${tries} ${tries === 1 ? 'try' : 'tries'} remaining!`);

				for (let i = 0; i < suggestions.length; i++) { embed.addField(`❯ ${10000 - (i * 1000)}`, display[i], true); }

				await msg.sendEmbed(embed);

				const msgs: any = await msg.channel.awaitMessages(res => res.author.id === msg.author.id, {
					max: 1,
					time: 30000
				});

				if (!msgs.size) {
					await msg.sendMessage('Time is up!');
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

			if (!display.includes('???')) { return msg.sendMessage('You win! Nice job, master of Google!'); }

			return msg.sendMessage('Better luck next time!');
		} catch (err) {
			this.playing.delete(msg.channel.id);

			return msg.sendMessage(`Oh no, an error occurred: \`${err.message}\`. Try again later!`, { reply: msg.author });
		}
	}

	private async fetchSuggestions(question: any) {
		const { text } = await require('node-superfetch')
			.get('https://suggestqueries.google.com/complete/search')
			.query({
				client: 'firefox',
				q: question
			});
		const suggestions = JSON.parse(text)[1].filter((suggestion: any) => suggestion.toLowerCase() !== question.toLowerCase());

		if (!suggestions.length) { return null; }

		return suggestions.map((suggestion: any) => suggestion.toLowerCase().replace(question.toLowerCase(), '').trim());
	}

}
