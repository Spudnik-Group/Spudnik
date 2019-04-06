import { Message, User } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { randomRange, verify } from '../../lib/helpers';

/**
 * Starts a game of Balloon Pop.
 *
 * @export
 * @class BalloonPopCommand
 * @extends {Command}
 */
export default class BalloonPopCommand extends Command {
	private playing = new Set();

	/**
	 * Creates an instance of BalloonPopCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof BalloonPopCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					default: () => this.client.user,
					key: 'opponent',
					prompt: 'What user would you like to play against?',
					type: 'user'
				}
			],
			description: 'Don\'t let yourself be the last one to pump the balloon before it pops!',
			details: 'syntax: \`!balloon-pop (@usermention)\`',
			examples: ['!balloon-pop', '!balloon-pop @someone'],
			group: 'game',
			guildOnly: true,
			memberName: 'balloon-pop',
			name: 'balloon-pop'
		});

	}

	/**
	 * Run the "BalloonPop" command.
	 *
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof BalloonPopCommand
	 */
	public async run(msg: CommandoMessage, args: { opponent: User }): Promise<Message | Message[]> {
		if (args.opponent.id === msg.author.id) { return msg.reply('You may not play against yourself.'); }
		if (this.playing.has(msg.channel.id)) { return msg.reply('Only one game may be occurring per channel.'); }
		this.playing.add(msg.channel.id);
		try {
			if (!args.opponent.bot) {
				await msg.say(`${args.opponent}, do you accept this challenge?`);
				const verification = await verify(msg.channel, args.opponent);
				if (!verification) {
					this.playing.delete(msg.channel.id);
					
					return msg.say('Looks like they declined...');
				}
			}
			let userTurn = false;
			let winner = null;
			let remains = 500;
			let turns = 0;
			while (!winner) {
				const user = userTurn ? msg.author : args.opponent;
				let pump;
				++turns;
				if (!args.opponent.bot || (args.opponent.bot && userTurn)) {
					await msg.say(`${user}, do you pump the balloon?`);
					pump = await verify(msg.channel, user);
				} else {
					pump = Boolean(Math.floor(Math.random() * 2));
				}
				if (pump) {
					await msg.say(`${user} pumps the balloon!`);
					remains -= randomRange(25, 75);
					const popped = Math.floor(Math.random() * remains);
					if (popped <= 0) {
						await msg.say('The balloon pops!');
						winner = userTurn ? args.opponent : msg.author;
						break;
					}
					if (turns >= 3) {
						turns = 0;
						userTurn = !userTurn;
					}
				} else {
					await msg.say(`${user} steps back!`);
					turns = 0;
					userTurn = !userTurn;
				}
			}
			this.playing.delete(msg.channel.id);
			
			return msg.say(`And the winner is... ${winner}! Great job!`);
		} catch (err) {
			this.playing.delete(msg.channel.id);
			throw err;
		}
	}
}
