import { Message, User } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { delay, getRandomInt, verify } from '../../lib/helpers';
const words = ['fire', 'draw', 'shoot', 'bang', 'pull'];

/**
 * Starts a game of Gun Fight.
 *
 * @export
 * @class GunFightCommand
 * @extends {Command}
 */
export default class GunFightCommand extends Command {
	private fighting = new Set();

	/**
	 * Creates an instance of GunFightCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof GunFightCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['western-gunfight'],
			args: [
				{
					key: 'opponent',
					prompt: 'What user would you like to gunfight?',
					type: 'user'
				}
			],
			description: 'Engage in a western gunfight against another user. High noon.',
			details: 'syntax: \`!gunfight <@usermention>\`',
			group: 'game',
			guildOnly: true,
			memberName: 'gunfight',
			name: 'gunfight'
		});
	}

	/**
	 * Run the "GunFight" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof GunFightCommand
	 */
	public async run(msg: KlasaMessage, args: { opponent: User }): Promise<KlasaMessage | KlasaMessage[]> {
		if (args.opponent.bot) { return msg.reply('Bots may not be fought.'); }

		if (args.opponent.id === msg.author.id) { return msg.reply('You may not fight yourself.'); }

		if (this.fighting.has(msg.channel.id)) { return msg.reply('Only one fight may be occurring per channel.'); }

		this.fighting.add(msg.channel.id);

		try {
			await msg.say(`${args.opponent}, do you accept this challenge?`);
			const verification = await verify(msg.channel, args.opponent);

			if (!verification) {
				this.fighting.delete(msg.channel.id);
				
				return msg.say('Looks like they declined...');
			}

			await msg.say('Get Ready...');
			await delay(getRandomInt(1000, 30000));

			const word = words[Math.floor(Math.random() * words.length)];

			await msg.say(`TYPE \`${word.toUpperCase()}\` NOW!`);

			const filter = (res: any) => [args.opponent.id, msg.author.id].includes(res.author.id) && res.content.toLowerCase() === word;
			const winner: any = await msg.channel.awaitMessages(filter, {
				max: 1,
				time: 30000
			});

			this.fighting.delete(msg.channel.id);
			if (!winner.size) { return msg.say('Oh... No one won.'); }
			
			return msg.say(`The winner is ${winner.first().author}!`);
		} catch (err) {
			this.fighting.delete(msg.channel.id);
			throw err;
		}
	}
}
