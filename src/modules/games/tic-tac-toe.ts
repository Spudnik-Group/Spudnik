import { stripIndents } from 'common-tags';
import { Message, User } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { verify } from '../../lib/helpers';

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
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'opponent',
					prompt: 'What user would you like to challenge?',
					type: 'user'
				}
			],
			description: 'Play a game of tic-tac-toe with another user.',
			group: 'games',
			guildOnly: true,
			memberName: 'tic-tac-toe',
			name: 'tic-tac-toe'
		});

	}

	/**
	 * Run the "TicTacToe" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof TicTacToeCommand
	 */
	public async run(msg: CommandMessage, args: { opponent: User }): Promise<Message | Message[]> {
		if (args.opponent.bot) { return msg.reply('Bots may not be played against.'); }
		if (args.opponent.id === msg.author.id) { return msg.reply('You may not play against yourself.'); }
		if (this.playing.has(msg.channel.id)) { return msg.reply('Only one game may be occurring per channel.'); }
		this.playing.add(msg.channel.id);
		try {
			await msg.say(`${args.opponent}, do you accept this challenge?`);
			const verification = await verify(msg.channel, args.opponent);
			if (!verification) {
				this.playing.delete(msg.channel.id);
				return msg.say('Looks like they declined...');
			}
			const sides: string[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8'];
			const taken: any[] = [];
			let userTurn = true;
			let winner = null;
			while (!winner && taken.length < 9) {
				const user = userTurn ? msg.author : args.opponent;
				const sign = userTurn ? 'X' : 'O';
				await msg.say(stripIndents`
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
					await msg.say('Sorry, time is up!');
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
				) { winner = userTurn ? msg.author : args.opponent; }
				userTurn = !userTurn;
			}
			this.playing.delete(msg.channel.id);
			return msg.say(winner ? `Congrats, ${winner}!` : 'Oh... The cat won.');
		} catch (err) {
			this.playing.delete(msg.channel.id);
			throw err;
		}
	}
}
