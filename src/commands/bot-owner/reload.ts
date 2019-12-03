/**
 * Copyright 2019 - Spudnik Group
 *
 * @summary Reloads a command.
 * @author Spudnik Group <comrades@spudnik.io> (https://spudnik.io)
 *
 * Created at     : 2019-08-30 11:48:13 
 * Last modified  : 2019-09-06 11:47:50
 */

import { Command, KlasaClient, CommandStore, KlasaMessage, Store, Stopwatch } from 'klasa';

/**
 * Reloads a command or command group.
 *
 * @export
 * @class ReloadCommandCommand
 * @extends {Command}
 */
export default class ReloadCommandCommand extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['reload-command', 'r'],
			description: 'Reloads a command or command group.',
			hidden: true,
			guarded: true,
			name: 'reload',
			permissionLevel: 10, // BOT OWNER
			usage: '<Store:store|Piece:piece|everything:default>'
		});
	}

	/**
	 * Run the "ReloadCommand" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {[piece]} piece
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof ReloadCommandCommand
	 */
	async run(message: KlasaMessage, [piece]: any) {
		if (piece === 'everything') return this.everything(message);
		if (piece instanceof Store) {
			const timer = new Stopwatch();
			await piece.loadAll();
			await piece.init();
			if (this.client.shard) {
				await this.client.shard.broadcastEval(`
					if (String(this.shard.id) !== '${this.client.shard.id}') this.${piece.name}.loadAll().then(() => this.${piece.name}.loadAll());
				`);
			}
			return message.sendLocale('COMMAND_RELOAD_ALL', [piece, timer.stop()]);
		}

		try {
			const itm = await piece.reload();
			const timer = new Stopwatch();
			if (this.client.shard) {
				await this.client.shard.broadcastEval(`
					if (String(this.shard.id) !== '${this.client.shard.id}') this.${piece.store}.get('${piece.name}').reload();
				`);
			}
			return message.sendLocale('COMMAND_RELOAD', [itm.type, itm.name, timer.stop()]);
		} catch (err) {
			piece.store.set(piece);
			return message.sendLocale('COMMAND_RELOAD_FAILED', [piece.type, piece.name]);
		}
	}

	async everything(message: KlasaMessage) {
		const timer = new Stopwatch();
		await Promise.all(this.client.pieceStores.map(async (store) => {
			await store.loadAll();
			await store.init();
		}));
		if (this.client.shard) {
			await this.client.shard.broadcastEval(`
				if (String(this.shard.id) !== '${this.client.shard.id}') this.pieceStores.map(async (store) => {
					await store.loadAll();
					await store.init();
				});
			`);
		}
		return message.sendLocale('COMMAND_RELOAD_EVERYTHING', [timer.stop()]);
	}
}
