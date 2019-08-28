import { stripIndents } from 'common-tags';
import { Collection, Message } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { awaitPlayers, escapeMarkdown, shuffle } from '../../lib/helpers';
// tslint:disable-next-line
const { blackCards, whiteCards } = require('../../extras/cards-against-humanity');

/**
 * Starts a game of Cards Against Humanity.
 *
 * @export
 * @class CardsAgainstHumanityCommand
 * @extends {Command}
 */
export default class CardsAgainstHumanityCommand extends Command {
	private playing = new Set();

	/**
	 * Creates an instance of CardsAgainstHumanityCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof CardsAgainstHumanityCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['crude-cards', 'pretend-youre-xyzzy', 'cah'],
			args: [
				{
					key: 'maxPts',
					label: 'maximum amount of points',
					max: 20,
					min: 1,
					prompt: 'What amount of points should determine the winner?',
					type: 'integer'
				},
				{
					default: false,
					key: 'noMidJoin',
					label: 'disable mid-game join',
					prompt: 'Do you want to disable mid-game joining?',
					type: 'boolean'
				}
			],
			description: 'Compete to see who can come up with the best card to fill in the blank.',
			details: 'syntax: \`!cards-against-humanity <maxpoints> (midgamejoin)\`',
			examples: ['!cards-against-humanity 15', '!cards-against-humanity 20 true'],
			group: 'game',
			guildOnly: true,
			memberName: 'cards-against-humanity',
			name: 'cards-against-humanity'
		});

	}

	/**
	 * Run the "CardsAgainstHumanity" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof CardsAgainstHumanityCommand
	 */
	public async run(msg: KlasaMessage, args: { maxPts: number, noMidJoin: boolean }): Promise<KlasaMessage | KlasaMessage[]> {
		if (this.playing.has(msg.channel.id)) { return msg.reply('Only one game may be occurring per channel.'); }
		this.playing.add(msg.channel.id);
		let joinLeaveCollector = null;
		let pointViewCollector = null;
		try {
			await msg.say('You will need at least 2 more players, at maximum 10. To join, type `join game`.');
			const awaitedPlayers = await awaitPlayers(msg, 10, 3);
			if (!awaitedPlayers) {
				this.playing.delete(msg.channel.id);
				
				return msg.say('Game could not be started...');
			}
			const players: any = new Collection();
			for (const user of awaitedPlayers) { this.generatePlayer(user, players); }
			const czars = players.map((player: any) => player.id);
			let winner = null;
			if (!args.noMidJoin) { joinLeaveCollector = this.createJoinLeaveCollector(msg.channel, players, czars); }
			pointViewCollector = this.createPointViewCollector(msg.channel, players);
			while (!winner) {
				for (const player of players) {
					if (player.strikes >= 3) { this.kickPlayer(player, players, czars); }
				}

				if (players.size < 3) {
					await msg.say('Oh... It looks like everyone left...');
					break;
				}

				const czar: any = players.get(czars[0]);

				czars.push(czar.id);
				czars.shift();

				const black = blackCards[Math.floor(Math.random() * blackCards.length)];

				await msg.say(stripIndents`
					The card czar will be ${czar.user}!
					The Black Card is: **${escapeMarkdown(black.text)}**
					Sending DMs...
				`);

				const chosenCards: any[] = [];

				await Promise.all(players.map((player: any) => this.playerTurn(player, czar, black, msg.channel, chosenCards)));

				if (!chosenCards.length) {
					await msg.say('Hmm... No one even tried.');
					continue;
				}

				const cards = shuffle(chosenCards);

				await msg.say(stripIndents`
					${czar.user}, which card${black.pick > 1 ? 's' : ''} do you pick?
					**Black Card**: ${escapeMarkdown(black.text)}
					${cards.map((card, i) => `**${i + 1}.** ${card.cards.join(', ')}`).join('\n')}
				`);

				const filter = (res: any) => {
					if (res.author.id !== czar.user.id) { return false; }

					if (!/^[0-9]+$/g.test(res.content)) { return false; }

					if (!cards[Number.parseInt(res.content, 10) - 1]) { return false; }

					return true;
				}

				const chosen = await msg.channel.awaitMessages(filter, {
					max: 1,
					time: 120000
				});

				if (!chosen.size) {
					await msg.say('Hmm... No one wins. Dealing back cards...');
					for (const pick of cards) {
						for (const card of pick.cards) { (players.get(pick.id) as any).hand.add(card); }
					}
					(players.get(czar.id) as any).strikes++;
					continue;
				}

				const player = players.get(cards[Number.parseInt(chosen.first()!.content, 10) - 1].id);

				if (!player) {
					await msg.say('Oh no, I think that player left! No points will be awarded...');
					continue;
				}

				++player.points;

				if (player.points >= args.maxPts) {
					winner = player.user;
				} else {
					const addS = player.points > 1 ? 's' : '';
					await msg.say(`Nice, ${player.user}! You now have **${player.points}** point${addS}!`);
				}
			}

			if (joinLeaveCollector) { joinLeaveCollector.stop(); }

			pointViewCollector.stop();

			this.playing.delete(msg.channel.id);

			if (!winner) { return msg.say('See you next time!'); }

			return msg.say(`And the winner is... ${winner}! Great job!`);
		} catch (err) {
			this.playing.delete(msg.channel.id);

			if (joinLeaveCollector) { (joinLeaveCollector as any).stop(); }

			if (pointViewCollector) { (pointViewCollector as any).stop(); }

			return msg.reply(`Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}

	private generatePlayer(user: any, players: any): any {
		const cards = new Set();
		for (let i = 0; i < 10; i++) {
			const valid = whiteCards.filter((card: any) => !cards.has(card));
			cards.add(valid[Math.floor(Math.random() * valid.length)]);
		}

		players.set(user.id, {
			hand: cards,
			id: user.id,
			points: 0,
			strikes: 0,
			user: user
		});

		return players;
	}

	private async playerTurn(player: any, czar: any, black: any, channel: any, chosenCards: any): Promise<any> {
		if (player.user.id === czar.user.id) { return; }
		if (player.hand.size < 10) {
			const valid = whiteCards.filter((card: any) => !player.hand.has(card));
			player.hand.add(valid[Math.floor(Math.random() * valid.length)]);
		}
		try {
			if (player.hand.size < black.pick) {
				await player.user.send('You don\'t have enough cards!');

				return;
			}

			const hand = Array.from(player.hand);

			await player.user.send(stripIndents`
				__**Your hand is**__: _(Type \`swap\` to exchange a point for a new hand.)_
				${hand.map((card, i) => `**${i + 1}.** ${card}`).join('\n')}
				**Black Card**: ${escapeMarkdown(black.text)}
				**Card Czar**: ${czar.user.username}
				Pick **${black.pick}** card${black.pick > 1 ? 's' : ''}!
			`);

			const chosen: any[] = [];
			const filter = (res: any) => {
				if (res.content.toLowerCase() === 'swap' && player.points > 0) { return true; }
				const existing = hand[Number.parseInt(res.content, 10) - 1];
				if (!existing) { return false; }
				if (chosen.includes(existing)) { return false; }
				chosen.push(existing);

				return true;
			}
			
			const choices = await player.user.dmChannel.awaitMessages(filter, {
				max: black.pick,
				time: 60000
			})

			if (choices.first().content.toLowerCase() === 'swap') {
				player.points--;
				await player.user.send('Swapping cards...');
				for (const card of player.hand) { player.hand.delete(card); }
				for (let i = 0; i < 10; i++) {
					const valid = whiteCards.filter((card: any) => !player.hand.has(card));
					player.hand.add(valid[Math.floor(Math.random() * valid.length)]);
				}

				return this.playerTurn(player, czar, black, channel, chosenCards);
			}

			if (choices.size < black.pick) {
				for (let i = 0; i < black.pick; i++) { chosen.push(hand[Math.floor(Math.random() * hand.length)]); }
				player.strikes++;
			}

			if (chosen.includes('<Blank>')) {
				if (choices.size < black.pick) {
					const handled = await this.handleBlank(player);
					chosen[chosen.indexOf('<Blank>')] = handled;
				} else {
					chosen[chosen.indexOf('<Blank>')] = 'A randomly chosen blank card.';
				}
			}

			for (const card of chosen) { player.hand.delete(card); }
			chosenCards.push({
				cards: chosen,
				id: player.id
			});

			await player.user.send(`Nice! Return to ${channel} to await the results!`);
		} catch (err) {
			return;
		}
	}

	private async handleBlank(player: any): Promise<any> {
		await player.user.send('What do you want the blank card to say? Must be 100 or less characters.');
		const blank = await player.user.dmChannel.awaitMessages((res: any) => res.content.length <= 100, {
			max: 1,
			time: 60000
		});

		player.hand.delete('<Blank>');

		if (!blank.size) { return `A blank card ${player.user.tag} forgot to fill out.`; }
		
		return blank.first().content;
	}

	private createJoinLeaveCollector(channel: any, players: any, czars: any): any {
		const filter = (res: any) => {
			if (res.author.bot) { return false; }
			if (players.has(res.author.id) && res.content.toLowerCase() !== 'leave game') { return false; }
			if (czars[0] === res.author.id || players.size >= 10) {
				res.react('❌').catch((): void => null);
				
				return false;
			}

			if (!['join game', 'leave game'].includes(res.content.toLowerCase())) { return false; }

			res.react('✅').catch((): void => null);

			return true;
		}

		const collector = channel.createMessageCollector(filter);

		collector.on('collect', (msg: any) => {
			if (msg.content.toLowerCase() === 'join game') {
				this.generatePlayer(msg.author, players);
				czars.push(msg.author.id);
			} else if (msg.content.toLowerCase() === 'leave game') {
				this.kickPlayer(msg.author, players, czars);
			}
		});

		return collector;
	}

	private createPointViewCollector(channel: any, players: any): any {
		const collector = channel.createMessageCollector((res: any) => {
			if (res.author.bot) { return false; }

			if (!players.has(res.author.id)) { return false; }

			if (res.content.toLowerCase() !== 'view points') { return false; }
			
			return true;
		});
		
		collector.on('collect', (msg: any) => {
			const player = players.get(msg.author.id);
			msg.reply(`You have **${player.points}** point${player.points > 1 ? 's' : ''}.`).catch((): void => null);
		});
		
		return collector;
	}

	private kickPlayer(player: any, players: any, czars: any) {
		players.delete(player.id);
		czars.splice(czars.indexOf(player.id), 1);
	}
}
