/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { verify } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';

/**
 * Starts a game of Tic Tac Toe.
 *
 * @export
 * @class TicTacToeCommand
 * @extends {Command}
 */
export default class TicTacToeCommand extends Command {

	private playing = new Set();

	/**
	 * Creates an instance of TicTacToeCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof TicTacToeCommand
	 */
	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Play a game of tic-tac-toe with another user.',
			extendedHelp: stripIndents`
				syntax: \`!tic-tac-toe <@userMention>\`
			`,
			name: 'tic-tac-toe',
			usage: '<opponent:User>'
		});

	}

	/**
	 * Run the "TicTacToe" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof TicTacToeCommand
	 */
	public async run(msg: KlasaMessage, [opponent]): Promise<KlasaMessage | KlasaMessage[]> {
		if (opponent.bot) { return msg.sendMessage('Bots may not be played against.', { reply: msg.author }); }
		if (opponent.id === msg.author.id) { return msg.sendMessage('You may not play against yourself.', { reply: msg.author }); }
		if (this.playing.has(msg.channel.id)) { return msg.sendMessage('Only one game may be occurring per channel.', { reply: msg.author }); }
		this.playing.add(msg.channel.id);

		try {
			await msg.sendMessage(`${opponent}, do you accept this challenge?`);
			const verification = await verify(msg.channel, opponent);

			if (!verification) {
				this.playing.delete(msg.channel.id);

				return msg.sendMessage('Looks like they declined...');
			}

			const sides: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8'];
			const taken: any[] = [];
			let userTurn = true;
			let winner = null;

			while (!winner && taken.length < 9) {
				const user = userTurn ? msg.author : opponent;
				const sign = userTurn ? 'X' : 'O';

				await msg.sendMessage(stripIndents`
					${user}, which side do you pick?
					\`\`\`
					${sides[0]} | ${sides[1]} | ${sides[2]}
					—————————
					${sides[3]} | ${sides[4]} | ${sides[5]}
					—————————
					${sides[6]} | ${sides[7]} | ${sides[8]}
					\`\`\`
				`);

				const filter = (res: any) => {
					const choice = res.content;

					return res.author.id === user.id && sides.includes(choice) && !taken.includes(choice);
				};

				const turn: any = await msg.channel.awaitMessages(filter, {
					max: 1,
					time: 30000
				});

				if (!turn.size) {
					await msg.sendMessage('Sorry, time is up!');
					userTurn = !userTurn;
					continue;
				}

				const choice = turn.first().content;

				sides[Number.parseInt(choice, 10)] = sign;
				taken.push(choice);

				if (
					(sides[0] === sides[1] && sides[0] === sides[2])
					|| (sides[0] === sides[3] && sides[0] === sides[6])
					|| (sides[3] === sides[4] && sides[3] === sides[5])
					|| (sides[1] === sides[4] && sides[1] === sides[7])
					|| (sides[6] === sides[7] && sides[6] === sides[8])
					|| (sides[2] === sides[5] && sides[2] === sides[8])
					|| (sides[0] === sides[4] && sides[0] === sides[8])
					|| (sides[2] === sides[4] && sides[2] === sides[6])
				) { winner = userTurn ? msg.author : opponent; }

				userTurn = !userTurn;
			}

			this.playing.delete(msg.channel.id);

			return msg.sendMessage(winner ? `Congrats, ${winner}!` : 'Oh... The cat won.');
		} catch (err) {
			this.playing.delete(msg.channel.id);

			throw err;
		}
	}

}
