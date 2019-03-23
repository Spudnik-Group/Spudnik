import { stripIndents } from 'common-tags';
import { Message, User } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { randomRange, verify } from '../../lib/helpers';

/**
 * Allows users to battle each other or the bot.
 *
 * @export
 * @class BattleCommand
 * @extends {Command}
 */
export default class BattleCommand extends Command {
	/**
	 * Creates an instance of BattleCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof BattleCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['fight', 'death-battle'],
			args: [
				{
					default: () => client.user,
					key: 'opponent',
					prompt: 'What user would you like to battle?',
					type: 'user'
				}
			],
			description: 'Engage in a turn-based battle against another user or the AI.',
			details: 'syntax: \`!battle (@usermention)\`',
			examples: ['!battle', '!battle @dumbperson'],
			group: 'games',
			guildOnly: true,
			memberName: 'battle',
			name: 'battle'
		});
	}

	/**
	 * Run the "battle" command.
	 *
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof BattleCommand
	 */
	public async run(msg: CommandoMessage, args: { opponent: User }): Promise<Message | Message[]> {
		const fighting = new Set();
		if (args.opponent.id === msg.author.id) {
			return msg.reply('You may not fight yourself.');
		}
		if (fighting.has(msg.channel.id)) {
			return msg.reply('Only one fight may be occurring per channel.');
		}
		fighting.add(msg.channel.id);
		try {
			if (!args.opponent.bot) {
				await msg.say(`${args.opponent}, do you accept this challenge?`);
				const verification = await verify(msg.channel, args.opponent);
				if (!verification) {
					fighting.delete(msg.channel.id);
					return msg.say('Looks like they declined...');
				}
			}
			let userHP = 500;
			let oppoHP = 500;
			let userTurn = false;
			let guard = false;
			const reset = (changeGuard = true) => {
				userTurn = !userTurn;
				if (changeGuard && guard) {
					guard = false;
				}
			};
			const dealDamage = (damage: any) => {
				if (userTurn) {
					oppoHP -= damage;
				} else {
					userHP -= damage;
				}
			};
			const forfeit = () => {
				if (userTurn) {
					userHP = 0;
				} else {
					oppoHP = 0;
				}
			};
			while (userHP > 0 && oppoHP > 0) {
				const user = userTurn ? msg.author : args.opponent;
				let choice;
				if (!args.opponent.bot || (args.opponent.bot && userTurn)) {
					await msg.say(stripIndents`
						${user}, do you **fight**, **guard**, **special**, or **run**?
						**${msg.author.username}**: ${userHP}HP
						**${args.opponent.username}**: ${oppoHP}HP
					`);
					const filter = (res: any) =>
						res.author.id === user.id && ['fight', 'guard', 'special', 'run'].includes(res.content.toLowerCase());
					const turn = await msg.channel.awaitMessages(filter, {
						max: 1,
						time: 30000
					});
					if (!turn.size) {
						await msg.say('Sorry, time is up!');
						reset();
						continue;
					}
					choice = turn.first()!.content.toLowerCase();
				} else {
					const choices = ['fight', 'guard', 'special'];
					choice = choices[Math.floor(Math.random() * choices.length)];
				}
				if (choice === 'fight') {
					const damage = Math.floor(Math.random() * (guard ? 10 : 100)) + 1;
					await msg.say(`${user} deals **${damage}** damage!`);
					dealDamage(damage);
					reset();
				} else if (choice === 'guard') {
					await msg.say(`${user} guards!`);
					guard = true;
					reset(false);
				} else if (choice === 'special') {
					const miss = Math.floor(Math.random() * 4);
					if (!miss) {
						const damage = randomRange(100, guard ? 150 : 300);
						await msg.say(`${user} deals **${damage}** damage!`);
						dealDamage(damage);
					} else {
						await msg.say(`${user}'s attack missed!`);
					}
					reset();
				} else if (choice === 'run') {
					await msg.say(`${user} flees!`);
					forfeit();
					break;
				} else {
					await msg.say('I do not understand what you want to do.');
				}
			}
			fighting.delete(msg.channel.id);
			const winner = userHP > oppoHP ? msg.author : args.opponent;
			return msg.say(`The match is over! Congrats, ${winner}!`);
		} catch (err) {
			fighting.delete(msg.channel.id);
			throw err;
		}
	}
}
