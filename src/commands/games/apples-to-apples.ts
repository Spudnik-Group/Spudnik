/**
 * Copyright (c) 2020 Spudnik Group
 */

import { stripIndents } from 'common-tags';
import { Collection } from 'discord.js';
import { awaitPlayers, shuffle } from '@lib/helpers';
import { Command, CommandStore, KlasaMessage } from 'klasa';
// tslint:disable-next-line:no-var-requires
const data = require('../../extras/apples-to-apples');

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
	constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Compete to see who can come up with the best card to match an adjective.',
			extendedHelp: 'syntax: \`!apples-to-apples <maxpoints>\`',
			name: 'apples-to-apples',
			usage: '<maxpoints:integer{1,20}>'
		});

	}

	/**
	 * Run the "ApplesToApples" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof ApplesToApplesCommand
	 */
	public async run(msg: KlasaMessage, [maxPts]): Promise<KlasaMessage | KlasaMessage[]> {
		if (this.playing.has(msg.channel.id)) { return msg.sendMessage('Only one game may be occurring per channel.', { reply: msg.author }); }
		this.playing.add(msg.channel.id);
		try {
			await msg.sendMessage('You will need at least 2 more players, at maximum 10. To join, type `join game`.');
			const awaitedPlayers = await awaitPlayers(msg, 10, 3);

			if (!awaitedPlayers) {
				this.playing.delete(msg.channel.id);

				return msg.sendMessage('Game could not be started...');
			}

			const players = await this.generatePlayers(awaitedPlayers);
			const czars = Array.from(players.values());
			let winner = null;

			while (!winner) {
				const czar: any = czars[0];

				czars.push(czar);
				czars.shift();

				const green = data.greenCards[Math.floor(Math.random() * data.greenCards.length)];

				await msg.sendMessage(stripIndents`
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
					await msg.sendMessage('Hmm... No one even tried.');

					break;
				}

				const cards = shuffle(chosenCards);

				await msg.sendMessage(stripIndents`
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
					await msg.sendMessage('Hmm... No one wins.');
					continue;
				}

				const player: any = players.get(cards[Number.parseInt(chosen.first()!.content, 10) - 1].id);

				++player.points;

				if (player.points >= maxPts) {
					winner = player.user;
				} else {
					await msg.sendMessage(`Nice one, ${player.user}! You now have **${player.points}** points!`);
				}
			}
			this.playing.delete(msg.channel.id);

			if (!winner) { return msg.sendMessage('See you next time!'); }

			return msg.sendMessage(`And the winner is... ${winner}! Great job!`);
		} catch (err) {
			this.playing.delete(msg.channel.id);

			return msg.sendMessage(`Oh no, an error occurred: \`${err.message}\`. Try again later!`, { reply: msg.author });
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
