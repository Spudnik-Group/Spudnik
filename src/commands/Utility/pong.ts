import { KlasaMessage, Command, KlasaClient, CommandStore } from 'klasa';
import { stripIndents } from 'common-tags';
import { delay } from '../../helpers/helpers';

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
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Used to return the ping.',
			name: 'pong'
		});
	}

	/**
	 * Run the "Pong" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof PongCommand
	 */
	async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		const pingMsg = await msg.sendMessage(stripIndents`
			В Советской России: понг пингует вас!
			Пинг сердцебиения составляет ${Math.round(msg.client.ws.ping)} мс
		`);

		await delay(3000);
		
		return msg.sendMessage(stripIndents`
			${msg.author},
			In Soviet Russia: Pong pings you!
			The message round-trip took ${(pingMsg as KlasaMessage).createdTimestamp - msg.createdTimestamp}ms.
			${msg.client.ws.ping ? `The heartbeat ping is ${Math.round(msg.client.ws.ping)}ms.` : ''}
		`);
	}
}