import { stripIndents } from 'common-tags';
import { Collection } from 'discord.js';
import { awaitPlayers, delay, sendSimpleEmbeddedError, shuffle } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';
// tslint:disable-next-line:no-var-requires
const data = require('../../extras/wizard-convention');

/**
 * Starts a game of Wizard Convention.
 *
 * @export
 * @class WizardConventionCommand
 * @extends {Command}
 */
export default class WizardConventionCommand extends Command {
	private playing = new Set();

	/**
	 * Creates an instance of WizardConventionCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof WizardConventionCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['wiz-convention'],
			description: 'Who is the Dragon? Who is the healer? Who is the mind reader? Will the Dragon eat them all?',
			name: 'wizard-convention'
		});

	}

	/**
	 * Run the "WizardConvention" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof WizardConventionCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		if (this.playing.has(msg.channel.id)) { return msg.sendMessage('Only one game may be occurring per channel.', { reply: msg.author }); }
		this.playing.add(msg.channel.id);

		try {
			await msg.sendMessage('You will need at least 2 more players, at maximum 10. To join, type `join game`.');

			const awaitedPlayers = await awaitPlayers(msg, 10, 3);

			if (!awaitedPlayers) {
				this.playing.delete(msg.channel.id);

				return msg.sendMessage('Game could not be started...');
			}

			const players: any = await this.generatePlayers(awaitedPlayers);
			let turn = 1;

			while (players.size > 2 && players.some((p: any) => p.role === 'dragon')) {
				let eaten = null;
				let healed = null;

				await msg.sendMessage(`Night ${turn}, sending DMs...`);

				for (const player of players.values()) {
					if (player.role.includes('pleb')) { continue; }

					await msg.sendMessage(`The ${player.role} is making their decision...`);

					const valid = players.filterArray((p: any) => p.role !== player.role);

					await player.user.send(stripIndents`
						${data.questions[player.role]} Please type the number.
						${valid.map((p: any, i: any) => `**${i + 1}.** ${p.user.tag}`).join('\n')}
					`);

					const filter = (res: any) => valid[Number.parseInt(res.content, 10) - 1];
					const decision = await player.user.dmChannel.awaitMessages(filter, {
						max: 1,
						time: 120000
					});

					if (!decision.size) {
						await player.user.send('Sorry, time is up!');
						continue;
					}
					const choice = Number.parseInt(decision.first().content, 10);

					if (player.role === 'dragon') {
						const chosen = players.get(choice);
						eaten = chosen.id;
						await player.user.send(`${chosen.user.tag} will be eaten...`);
					} else if (player.role === 'healer') {
						const chosen = players.get(choice);
						healed = chosen.id;
						await player.user.send(`${chosen.user.tag} will be healed...`);
					} else if (player.role === 'mind reader') {
						await player.user.send(players.find((p: any) => p.role === 'dragon').id === choice ? 'Yes.' : 'No.');
					}
				}

				const display = eaten ? players.get(eaten).user : null;
				const story = data.stories[Math.floor(Math.random() * data.stories.length)];

				if (eaten && eaten !== healed) { players.delete(eaten); }

				if (eaten && eaten === healed) {
					await msg.sendMessage(stripIndents`
						Late last night, a dragon emerged and tried to eat ${display}${story}
						Thankfully, a healer stepped in just in time to save the day.
						Who is this mysterious dragon? You have one minute to decide.
					`);
				} else if (eaten && players.size < 3) {
					await msg.sendMessage(stripIndents`
						Late last night, a dragon emerged and devoured poor ${display}${story}
						Sadly, after the event, the final wizard ran in fear, leaving the dragon to rule forever.
					`);
					break;
				} else if (eaten && eaten !== healed) {
					await msg.sendMessage(stripIndents`
						Late last night, a dragon emerged and devoured poor ${display}${story}
						Who is this mysterious dragon? You have one minute to decide.
					`);
				} else {
					await msg.sendMessage(stripIndents`
						Late last night, a dragon emerged. Thankfully, however, it didn't try to eat anyone.
						Who is this mysterious dragon? You have one minute to decide.
					`);
				}

				await delay(60000);

				const playersArr = Array.from(players.values());

				await msg.sendMessage(stripIndents`
					Who do you think is the dragon? Please type the number.
					${playersArr.map((p: any, i: any) => `**${i + 1}.** ${p.user.tag}`).join('\n')}
				`);

				const voted: any[] = [];

				const filter = (res: any) => {
					if (!players.exists((p: any) => p.user.id === res.author.id)) { return false; }
					if (voted.includes(res.author.id)) { return false; }
					if (!playersArr[Number.parseInt(res.content, 10) - 1]) { return false; }

					voted.push(res.author.id);

					return true;
				}

				const votes = await msg.channel.awaitMessages(filter, {
					max: players.size,
					time: 120000
				});

				if (!votes.size) {
					await msg.sendMessage('No one will be expelled.');
					continue;
				}

				const expelled: any = this.getExpelled(votes, players, playersArr);

				await msg.sendMessage(`${expelled.user} will be expelled.`);

				players.delete(expelled.id);

				++turn;
			}

			this.playing.delete(msg.channel.id);

			const dragon = players.find((p: any) => p.role === 'dragon');

			if (!dragon) { return msg.sendMessage('The dragon has been vanquished! Thanks for playing!'); }

			return msg.sendMessage(`Oh no, the dragon wasn't caught in time... Nice job, ${dragon.user}!`);
		} catch (err) {
			this.playing.delete(msg.channel.id);

			return sendSimpleEmbeddedError(msg, `Oh no, an error occurred: \`${err.message}\`. Try again later!`);
		}
	}

	private async generatePlayers(list: any) {
		let roles = ['dragon', 'healer', 'mind reader'];

		for (let i = 0; i < (list.length - 2); i++) { roles.push(`pleb ${i + 1}`); }

		roles = shuffle(roles);

		const players = new Collection();
		let i = 0;

		for (const user of list) {
			players.set(user.id, {
				id: user.id,
				role: roles[i],
				user: user
			});
			await user.send(`Your role will be: ${roles[i]}!`);
			i++;
		}
	}

	private getExpelled(votes: any, players: any, playersArr: any) {
		const counts: any = new Collection();

		for (const vote of votes.values()) {
			const player = players.get(playersArr[Number.parseInt(vote.content, 10) - 1].id);

			if (counts.has(player.id)) {
				++counts.get(player.id).votes;
			} else {
				counts.set(player.id, {
					id: player.id,
					user: player.user,
					votes: 1
				});
			}
		}

		return counts.sort((a: any, b: any) => b.votes - a.votes).first();
	}
}
