/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { verify } from '@lib/helpers/base';
import { Command, CommandStore, KlasaMessage } from 'klasa';
import * as events from '../../extras/hunger-games';
import { User } from 'discord.js';
import { shuffle } from '@lib/utils/util';

/**
 * Starts a game of Hunger Games.
 *
 * @export
 * @class HungerGamesCommand
 * @extends {Command}
 */
export default class HungerGamesCommand extends Command {

	private playing: Set<string> = new Set();

	/**
	 * Creates an instance of HungerGamesCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof HungerGamesCommand
	 */
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['hunger-games-simulator', 'brant-steele'],
			description: 'Simulate a Hunger Games match with up to 24 tributes.',
			usage: '<tributes:user> [...]'
		});
	}

	/**
	 * Run the "HungerGames" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof HungerGamesCommand
	 */
	public async run(msg: KlasaMessage, [...tributes]: [User[]]): Promise<KlasaMessage | KlasaMessage[]> {
		if (tributes.length < 2) return msg.sendMessage(`...${tributes[0]} wins, as they were the only tribute.`);
		if (tributes.length > 24) return msg.sendMessage('Please do not enter more than 24 tributes.', { reply: msg.author });
		if (new Set(tributes).size !== tributes.length) return msg.sendMessage('Please do not enter the same tribute twice.', { reply: msg.author });
		if (this.playing.has(msg.channel.id)) return msg.sendMessage('Only one game may be occurring per channel.', { reply: msg.author });

		this.playing.add(msg.channel.id);

		try {
			let sun = true;
			let turn = 0;
			let bloodbath = true;
			const remaining = new Set(shuffle(tributes));

			while (remaining.size > 1) {
				if (!bloodbath && sun) ++turn;
				const sunEvents = bloodbath ? events.bloodbath : sun ? events.day : events.night;
				const results: any[] = [];
				const deaths: any[] = [];
				this.makeEvents(remaining, sunEvents, deaths, results);
				let text = stripIndents`
					__**${bloodbath ? 'Bloodbath' : sun ? `Day ${turn}` : `Night ${turn}`}**__:
					${results.join('\n')}
				`;
				if (deaths.length) {
					text += '\n\n';
					text += stripIndents`
						**${deaths.length} cannon shot${deaths.length === 1 ? '' : 's'} can be heard in the distance.**
						${deaths.join('\n')}
					`;
				}
				text += '\n\n_Proceed?_';
				await msg.sendMessage(text);
				const verification = await verify(msg.channel, msg.author, 120000);
				if (!verification) {
					this.playing.delete(msg.channel.id);

					return msg.sendMessage('See you next time!');
				}
				if (!bloodbath) sun = !sun;
				if (bloodbath) bloodbath = false;
			}

			this.playing.delete(msg.channel.id);
			const remainingArr = Array.from(remaining);

			return msg.sendMessage(`And the winner is... ${remainingArr[0]}!`);
		} catch (err) {
			this.playing.delete(msg.channel.id);

			throw err;
		}
	}

	private parseEvent(event: string, tributes: string[]): string {
		return event
			.replace(/\(Player1\)/gi, `**${tributes[0]}**`)
			.replace(/\(Player2\)/gi, `**${tributes[1]}**`)
			.replace(/\(Player3\)/gi, `**${tributes[2]}**`)
			.replace(/\(Player4\)/gi, `**${tributes[3]}**`)
			.replace(/\(Player5\)/gi, `**${tributes[4]}**`)
			.replace(/\(Player6\)/gi, `**${tributes[5]}**`);
	}

	private makeEvents(tributes: Set<any>, eventsArr: any[], deaths: string[], results: any[]): void {
		const turn = new Set(tributes);
		for (const tribute of tributes) {
			if (!turn.has(tribute)) continue;
			const valid = eventsArr.filter((event: any) => event.tributes <= turn.size && event.deaths < turn.size);
			const event = valid[Math.floor(Math.random() * valid.length)];
			turn.delete(tribute);
			if (event.tributes === 1) {
				if (event.deaths.length === 1) {
					deaths.push(tribute);
					tributes.delete(tribute);
				}
				results.push(this.parseEvent(event.text, [tribute]));
			} else {
				const current = [tribute];
				if (event.deaths.includes(1)) {
					deaths.push(tribute);
					tributes.delete(tribute);
				}
				for (let i = 2; i <= event.tributes; i++) {
					const turnArr = Array.from(turn);
					const tribu = turnArr[Math.floor(Math.random() * turnArr.length)];
					if (event.deaths.includes(i)) {
						deaths.push(tribu);
						tributes.delete(tribu);
					}
					current.push(tribu);
					turn.delete(tribu);
				}
				results.push(this.parseEvent(event.text, current));
			}
		}
	}

}
