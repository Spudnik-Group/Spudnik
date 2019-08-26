import { Message } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';

/**
 * Starts a game of Chance.
 *
 * @export
 * @class ChanceCommand
 * @extends {Command}
 */
export default class ChanceCommand extends Command {
	/**
	 * Creates an instance of ChanceCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof ChanceCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['1-in', 'one-in', 'lottery-classic'],
			args: [
				{
					default: 1000,
					key: 'chance',
					prompt: 'What is the chance of winning? 1 in what?',
					type: 'string'
				}
			],
			description: 'Attempt to win with a 1 in 1000 (or your choice) chance of winning.',
			details: 'syntax: \`!chance <chance of winning>\`',
			examples: ['!chance 100', '!chance'],
			group: 'game',
			guildOnly: true,
			memberName: 'chance',
			name: 'chance'
		});

	}

	/**
	 * Run the "Chance" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof ChanceCommand
	 */
	public async run(msg: KlasaMessage, args: { chance: string }): Promise<KlasaMessage | KlasaMessage[]> {
		const loss = Math.floor(Math.random() * +args.chance);
		if (!loss) { return msg.reply('Nice job! 10/10! You deserve some cake!'); }
		
		return msg.reply('Nope, sorry, you lost.');
	}
}
