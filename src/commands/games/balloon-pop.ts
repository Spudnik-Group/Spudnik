/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, KlasaMessage } from 'klasa';
import { verify, getRandomInt } from '@lib/helpers/base';
import { User } from 'discord.js';

/**
 * Starts a game of Balloon Pop.
 *
 * @export
 * @class BalloonPopCommand
 * @extends {Command}
 */
export default class BalloonPopCommand extends Command {

	private playing: Set<string> = new Set();

	/**
	 * Creates an instance of BalloonPopCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof BalloonPopCommand
	 */
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Don\'t let yourself be the last one to pump the balloon before it pops!',
			extendedHelp: 'syntax: \`!balloon-pop (@usermention)\`',
			name: 'balloon-pop',
			usage: '(opponent:user)'
		});

	}

	/**
	 * Run the "BalloonPop" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof BalloonPopCommand
	 */
	public async run(msg: KlasaMessage, [opp]: [User]): Promise<KlasaMessage | KlasaMessage[]> {
		const opponent = opp ? opp : this.client.user;
		if (opponent.id === msg.author.id) return msg.sendMessage('You may not play against yourself.', { reply: msg.author });
		if (this.playing.has(msg.channel.id)) return msg.sendMessage('Only one game may be occurring per channel.', { reply: msg.author });
		this.playing.add(msg.channel.id);
		try {
			if (!opponent.bot) {
				await msg.sendMessage(`${opponent}, do you accept this challenge?`);
				const verification = await verify(msg.channel, opponent);
				if (!verification) {
					this.playing.delete(msg.channel.id);

					return msg.sendMessage('Looks like they declined...');
				}
			}
			let userTurn = false;
			let winner = null;
			let remains = 500;
			let turns = 0;
			while (!winner) {
				const user = userTurn ? msg.author : opponent;
				let pump;
				++turns;
				if (!opponent.bot || (opponent.bot && userTurn)) {
					await msg.sendMessage(`${user}, do you pump the balloon?`);
					pump = await verify(msg.channel, user);
				} else {
					pump = Boolean(Math.floor(Math.random() * 2));
				}
				if (pump) {
					await msg.sendMessage(`${user} pumps the balloon!`);
					remains -= getRandomInt(25, 75);
					const popped = Math.floor(Math.random() * remains);
					if (popped <= 0) {
						await msg.sendMessage('The balloon pops!');
						winner = userTurn ? opponent : msg.author;
						break;
					}
					if (turns >= 3) {
						turns = 0;
						userTurn = !userTurn;
					}
				} else {
					await msg.sendMessage(`${user} steps back!`);
					turns = 0;
					userTurn = !userTurn;
				}
			}
			this.playing.delete(msg.channel.id);

			return msg.sendMessage(`And the winner is... ${winner}! Great job!`);
		} catch (err) {
			this.playing.delete(msg.channel.id);
			throw err;
		}
	}

}
