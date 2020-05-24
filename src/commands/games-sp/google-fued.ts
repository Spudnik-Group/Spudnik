/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, KlasaMessage } from 'klasa';
import { MessageEmbed } from 'discord.js';
import { questions } from '../../extras/google-feud';
import axios from 'axios';

/**
 * Starts a game of Google Feud.
 *
 * @export
 * @class GoogleFeudCommand
 * @extends {Command}
 */
export default class GoogleFeudCommand extends Command {

	private playing: Set<string> = new Set();

	/**
	 * Creates an instance of GoogleFeudCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof GoogleFeudCommand
	 */
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['googlefued'],
			description: 'Attempt to determine the top suggestions for a Google search.',
			usage: '(question:question)'
		});

		this.createCustomResolver('question', (arg: string) => arg ? arg : questions[Math.floor(Math.random() * questions.length)]);
	}

	/**
	 * Run the "GoogleFeud" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof GoogleFeudCommand
	 */
	public async run(msg: KlasaMessage, [question]: [string]): Promise<KlasaMessage | KlasaMessage[]> {
		if (this.playing.has(msg.channel.id)) return msg.sendSimpleEmbedReply('Only one fight may be occurring per channel.');
		this.playing.add(msg.channel.id);

		try {
			const suggestions = await this.fetchSuggestions(question);

			if (!suggestions) return msg.sendMessage('Could not find any results.');

			const display = new Array(suggestions.length).fill('???');
			let tries = 3;

			while (display.includes('???') && tries) {
				const embed = new MessageEmbed()
					.setColor(0x005AF0)
					.setTitle(`${question}...?`)
					.setDescription('Type the choice you think is a suggestion _without_ the question.')
					.setFooter(`${tries} ${tries === 1 ? 'try' : 'tries'} remaining!`);

				for (let i = 0; i < suggestions.length; i++) embed.addField(`❯ ${10000 - (i * 1000)}`, display[i], true);

				await msg.sendEmbed(embed);

				const msgs: any = await msg.channel.awaitMessages((res: any) => res.author.id === msg.author.id, {
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

					await msgs.first().delete();
				} else {
					--tries;
					// TODO: add a red X reaction to failed tries?
				}
			}

			this.playing.delete(msg.channel.id);

			if (!display.includes('???')) return msg.sendMessage('You win! Nice job, master of Google!');

			return msg.sendMessage('Better luck next time!');
		} catch (err) {
			this.playing.delete(msg.channel.id);

			msg.client.emit('warn', `Error in command games-sp:google-fued: ${err}`);

			return msg.sendSimpleError('There was an error with the request. Try again?', 3000);
		}
	}

	private async fetchSuggestions(question: any): Promise<any> {
		const { data } = await axios
			.get(`https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(question)}`);
		const suggestions = data[1].filter((suggestion: any) => suggestion.toLowerCase() !== question.toLowerCase());

		if (!suggestions.length) return null;

		return suggestions.map((suggestion: any) => suggestion.toLowerCase().replace(question.toLowerCase(), '').trim());
	}

}
