import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { stripIndents } from 'common-tags';
import { startTyping, stopTyping, deleteCommandMessages } from '../../lib/helpers';

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
			examples: ['!pong'],
			group: 'util',
			guildOnly: true,
			memberName: 'pong',
			name: 'pong',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "Pong" command.
	 *
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof PongCommand
	 */
	public async run(msg: CommandoMessage): Promise<Message | Message[]> {
		startTyping(msg);
		const pingMsg = await msg.reply(stripIndents`
			В Советской России: понг пингует вас!
			Пинг сердцебиения составляет ${Math.round(this.client.ws.ping)} мс
		`);

		deleteCommandMessages(msg, this.client);
		stopTyping(msg);
		
		return (pingMsg as Message).edit(stripIndents`
			${msg.channel.type !== 'dm' ? `${msg.author},` : ''}
			In Soviet Russia: Pong pings you!
			The message round-trip took ${(pingMsg as Message).createdTimestamp - msg.createdTimestamp}ms.
			${this.client.ws.ping ? `The heartbeat ping is ${Math.round(this.client.ws.ping)}ms.` : ''}
		`);
	}
}
