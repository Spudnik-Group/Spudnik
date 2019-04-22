import { stripIndents } from 'common-tags';
import { Collection, Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { awaitPlayers, shuffle } from '../../lib/helpers';
// tslint:disable-next-line:no-var-requires
const data = require('../../extras/apples-to-apples.js');

/**
 * Starts a game of Apples To Apples.
 *
 * @export
 * @class ApplesToApplesCommand
 * @extends {Command}
 */
export default class ApplesToApplesCommand extends Command {
	private playing = new Set();

	/**
	 * Creates an instance of ApplesToApplesCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof ApplesToApplesCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'maxPts',
					label: 'maximum amount of points',
					max: 20,
					min: 1,
					prompt: 'What amount of points should determine the winner?',
					type: 'integer'
				}
			],
			description: 'Compete to see who can come up with the best card to match an adjective.',
			details: 'syntax: \`!apples-to-apples <maxpoints>\`',
			examples: ['!apples-to-apples 15'],
			group: 'game',
			guildOnly: true,
			memberName: 'apples-to-apples',
			name: 'apples-to-apples'
		});

	}

	/**
	 * Run the "ApplesToApples" command.
	 *
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof ApplesToApplesCommand
	 */
	public async run(msg: CommandoMessage, args: { maxPts: number }): Promise<Message | Message[]> {
		if (this.playing.has(msg.channel.id)) { return msg.reply('Only one game may be occurring per channel.'); }
		this.playing.add(msg.channel.id);
		try {
			await msg.say('You will need at least 2 more players, at maximum 10. To join, type `join game`.');
			const awaitedPlayers = await awaitPlayers(msg, 10, 3);
			
			if (!awaitedPlayers) {
				this.playing.delete(msg.channel.id);

				return msg.say('Game could not be started...');
			}

			const players = await this.generatePlayers(awaitedPlayers);
			const czars = Array.from(players.values());
			let winner = null;

			while (!winner) {
				const czar: any = czars[0];

				czars.push(czar);
				czars.shift();

				const green = data.greenCards[Math.floor(Math.random() * data.greenCards.length)];

				await msg.say(stripIndents`
					The card czar will be ${czar.user}!
					The Green Card is: **${require('remove-markdown')(green)}**

					Sending DMs...
				`);

				const chosenCards: any[] = [];
				const turns = players.map(async (player: any) => {
					if (player.hand.size < 11) {
						const valid = data.redCards.filter((card: any) => !player.hand.has(card));
						player.hand.add(valid[Math.floor(Math.random() * valid.length)]);
					}

					if (player.user.id === czar.user.id) { return; }

					if (!player.hand.size) {
						await player.user.send('You don\'t have enough cards!');

						return;
					}
					const hand = Array.from(player.hand);

					await player.user.send(stripIndents`
						__**Your hand is**__:
						${hand.map((card, i) => `**${i + 1}.** ${card}`).join('\n')}

						**Green Card**: ${(green)}
						**Card Czar**: ${czar.user.username}
						Pick **1** card!
					`);

					let chosen = null;

					const filter = (res: any) => {
						const existing = hand[Number.parseInt(res.content, 10) - 1];

						if (!existing) { return false; }

						chosen = existing;

						return true;
					}

					const choice = await player.user.dmChannel.awaitMessages(filter, {
						max: 1,
						time: 120000
					});
					
					if (!choice.size) {
						await player.user.send('Skipping your turn...');

						return;
					}

					if (chosen === '<Blank>') {
						const handled = await this.handleBlank(player);
						chosen = handled;
					} else {
						player.hand.delete(chosen);
					}

					chosenCards.push({
						card: chosen,
						id: player.id
					});

					await player.user.send(`Nice! Return to ${msg.channel} to await the results!`);
				});

				await Promise.all(turns);

				if (!chosenCards.length) {
					await msg.say('Hmm... No one even tried.');

					break;
				}

				const cards = shuffle(chosenCards);

				await msg.say(stripIndents`
					${czar.user}, which card do you pick?
					**Green Card**: ${require('remove-markdown')(green)}

					${cards.map((card, i) => `**${i + 1}.** ${card.card}`).join('\n')}
				`);

				const filter = (res: any) => {
					if (res.author.id !== czar.user.id) { return false; }

					if (!cards[Number.parseInt(res.content, 10) - 1]) { return false; }
					
					return true;
				}

				const chosen = await msg.channel.awaitMessages(filter, {
					max: 1,
					time: 120000
				});

				if (!chosen.size) {
					await msg.say('Hmm... No one wins.');
					continue;
				}

				const player: any = players.get(cards[Number.parseInt(chosen.first()!.content, 10) - 1].id);

				++player.points;

				if (player.points >= args.maxPts) {
					winner = player.user;
				} else {
					await msg.say(`Nice one, ${player.user}! You now have **${player.points}** points!`);
				}
			}
			this.playing.delete(msg.channel.id);

			if (!winner) { return msg.say('See you next time!'); }

			return msg.say(`And the winner is... ${winner}! Great job!`);
		} catch (err) {
			this.playing.delete(msg.channel.id);

			return msg.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}

	private async generatePlayers(list: any) {
		const players = new Collection();

		for (const user of list) {
			const cards = new Set();
			for (let i = 0; i < 5; i++) {
				const valid = data.redCards.filter((card: any) => !cards.has(card));
				cards.add(valid[Math.floor(Math.random() * valid.length)]);
			}

			players.set(user.id, {
				hand: cards,
				id: user.id,
				points: 0,
				user: user
			});

			await user.send('Hi! Waiting for your turn to start...');
		}

		return players;
	}

	private async handleBlank(player: any) {
		await player.user.send('What do you want the blank card to say? Must be 100 or less characters.');
		const blank = await player.user.dmChannel.awaitMessages((res: any) => res.content.length <= 100, {
			max: 1,
			time: 120000
		});

		player.hand.delete('<Blank>');

		if (!blank.size) { return `A blank card ${player.user.tag} forgot to fill out.`; }
		
		return blank.first().content;
	}
}
