import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Unloads a command.
 *
 * @export
 * @class UnloadCommandCommand
 * @extends {Command}
 */
export default class extends Command {
	/**
	 * Creates an instance of UnloadCommandCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof UnloadCommandCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['unload-command', 'u'],
			description: 'Unloads a command.',
			guarded: true,
			hidden: true,
			name: 'unload',
			permissionLevel: 10,
			usage: '<Piece:piece>'
		});
	}

	/**
	 * Run the "UnloadCommand" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ command: Command }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof UnloadCommandCommand
	 */
	public async run(msg: KlasaMessage, [piece]: any): Promise<KlasaMessage | KlasaMessage[]> {
		if ((piece.type === 'event' && piece.name === 'message') || (piece.type === 'monitor' && piece.name === 'commandHandler')) {
			return msg.sendLocale('COMMAND_UNLOAD_WARN');
		}
		piece.unload();

		if(this.client.shard) {
			try {
				await this.client.shard.broadcastEval(`
					if(this.shard.id !== ${this.client.shard.id}) this.${piece.store}.get('${piece.name}').unload();
				`);
			} catch(err) {
				this.client.emit('warn', 'Error when broadcasting command unload to other shards');
				this.client.emit('error', err);
				return msg.sendMessage(`Unloaded \`${piece.name}\` command, but failed to unload on other shards.`);
			}
		}

		return msg.sendMessage(`Unloaded \`${piece.name}\` command${this.client.shard ? ' on all shards' : ''}.`);
	}
}