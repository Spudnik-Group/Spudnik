import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';

/**
 * Returns the bot's ping.
 *
 * @export
 * @class PongCommand
 * @extends {Command}
 */
export default class PongCommand extends Command {
	/**
	 * Creates an instance of PongCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof PongCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Used to return the ping.',
			examples: ['!Pong'],
			group: 'util',
			guildOnly: true,
			memberName: 'Pong',
			name: 'Pong',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "Pong" command.
	 *
	 * @param {CommandMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof PongCommand
	 */
	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		if(!msg.editable) {
			const pingMsg = await msg.reply('Ping.');
			return (pingMsg as Message).edit(`
				${msg.channel.type !== 'dm' ? `${msg.author},` : ''}
				In Soviet Russia: Pong ping you!
				The message round-trip took ${(pingMsg as Message).createdTimestamp - msg.createdTimestamp}ms.
				${this.client.ping ? `The heartbeat ping is ${Math.round(this.client.ping)}ms.` : ''}
			`);
		} else {
			await msg.edit('Pinging...');
			return msg.edit(`
			In Soviet Russia: Pong ping you!
			The message round-trip took ${msg.editedTimestamp - msg.createdTimestamp}ms.
				${this.client.ping ? `The heartbeat ping is ${Math.round(this.client.ping)}ms.` : ''}
			`);
		}
	}
}
