/**
 * Copyright 2019 - Spudnik Group
 *
 * @summary Unloads a command.
 * @author Spudnik Group <comrades@spudnik.io> (https://spudnik.io)
 *
 * Created at     : 2019-08-30 11:48:41 
 * Last modified  : 2019-08-30 12:31:54
 */

import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';

/**
 * Unloads a command.
 *
 * @export
 * @class UnloadCommandCommand
 * @extends {Command}
 */
export default class UnloadCommandCommand extends Command {
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
	 * @param {[piece]} piece
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
