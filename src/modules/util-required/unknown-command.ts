import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';

/**
 * Processes unknown commands.
 *
 * @export
 * @class UnknownCommandCommand
 * @extends {Command}
 */
export default class UnknownCommandCommand extends Command {
	/**
	 * Creates an instance of UnknownCommandCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof UnknownCommandCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Processes unknown commands.',
			examples: ['unknown-command kickeverybodyever'],
			group: 'util',
			hidden: true,
			memberName: 'unknown-command',
			name: 'unknown-command',
			unknown: true
		});
	}

	/**
	 * Run the "UnknownCommand" command.
	 *
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof UnknownCommandCommand
	 */
	public async run(msg: CommandoMessage): Promise<Message | Message[]> {
		return;
	}
}
