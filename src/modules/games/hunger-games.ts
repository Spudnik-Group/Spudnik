import { stripIndents } from 'common-tags';
import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { shuffle, verify } from '../../lib/helpers';
//tslint:disable-next-line
const events = require('../../extras/hunger-games');

/**
 * Starts a game of Hunger Games.
 *
 * @export
 * @class HungerGamesCommand
 * @extends {Command}
 */
export default class HungerGamesCommand extends Command {
	private playing = new Set();

	/**
	 * Creates an instance of HungerGamesCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof HungerGamesCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['hunger-games-simulator', 'brant-steele'],
			args: [
				{
					infinite: true,
					key: 'tributes',
					max: 20,
					prompt: 'Who should compete in the games? Up to 24 tributes can participate.',
					type: 'string'
				}
			],
			description: 'Simulate a Hunger Games match with up to 24 tributes.',
			examples: ['!hunger games @weakperson @strongperson'],
			group: 'games',
			guildOnly: true,
			memberName: 'hunger-games',
			name: 'hunger-games'
		});

	}

	/**
	 * Run the "HungerGames" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof HungerGamesCommand
	 */
	public async run(msg: CommandMessage, args: { tributes: string[] }): Promise<Message | Message[]> {
		if (args.tributes.length < 2) { return msg.say(`...${args.tributes[0]} wins, as they were the only tribute.`); }
		if (args.tributes.length > 24) { return msg.reply('Please do not enter more than 24 tributes.'); }
		if (new Set(args.tributes).size !== args.tributes.length) { return msg.reply('Please do not enter the same tribute twice.'); }
		if (this.playing.has(msg.channel.id)) { return msg.reply('Only one game may be occurring per channel.'); }
		this.playing.add(msg.channel.id);
		try {
			let sun = true;
			let turn = 0;
			let bloodbath = true;
			const remaining = new Set(shuffle(args.tributes));
			while (remaining.size > 1) {
				if (!bloodbath && sun) { ++turn; }
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
				await msg.say(text);
				const verification = await verify(msg.channel, msg.author, 120000);
				if (!verification) {
					this.playing.delete(msg.channel.id);
					return msg.say('See you next time!');
				}
				if (!bloodbath) { sun = !sun; }
				if (bloodbath) { bloodbath = false; }
			}
			this.playing.delete(msg.channel.id);
			const remainingArr = Array.from(remaining);
			return msg.say(`And the winner is... ${remainingArr[0]}!`);
		} catch (err) {
			this.playing.delete(msg.channel.id);
			throw err;
		}
	}

	private parseEvent(event: string, tributes: string[]) {
		return event
			.replace(/\(Player1\)/gi, `**${tributes[0]}**`)
			.replace(/\(Player2\)/gi, `**${tributes[1]}**`)
			.replace(/\(Player3\)/gi, `**${tributes[2]}**`)
			.replace(/\(Player4\)/gi, `**${tributes[3]}**`)
			.replace(/\(Player5\)/gi, `**${tributes[4]}**`)
			.replace(/\(Player6\)/gi, `**${tributes[5]}**`);
	}

	private makeEvents(tributes: Set<any>, eventsArr: any[], deaths: string[], results: any[]) {
		const turn = new Set(tributes);
		for (const tribute of tributes) {
			if (!turn.has(tribute)) { continue; }
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
