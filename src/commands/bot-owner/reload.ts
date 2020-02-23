/**
 * Copyright (c) 2020 Spudnik Group
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
			guarded: true,
			hidden: true,
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
	public async run(message: KlasaMessage, [piece]: any): Promise<KlasaMessage | KlasaMessage[]> {
		if (piece === 'everything') return this.everything(message);
		if (piece instanceof Store) {
			const timer = new Stopwatch();
			await piece.loadAll();
			await piece.init();
			if (this.client.shard) {
				await this.client.shard.broadcastEval(`
					if (String(this.shard.id) !== '${this.client.shard.ids}') this.${piece.name}.loadAll().then(() => this.${piece.name}.loadAll());
				`);
			}

			return message.sendLocale('COMMAND_RELOAD_ALL', [piece, timer.stop()]);
		}

		try {
			const itm = await piece.reload();
			const timer = new Stopwatch();
			if (this.client.shard) {
				await this.client.shard.broadcastEval(`
					if (String(this.shard.id) !== '${this.client.shard.ids}') this.${piece.store}.get('${piece.name}').reload();
				`);
			}

			return message.sendLocale('COMMAND_RELOAD', [itm.type, itm.name, timer.stop()]);
		} catch (err) {
			piece.store.set(piece);

			return message.sendLocale('COMMAND_RELOAD_FAILED', [piece.type, piece.name]);
		}
	}

	private async everything(message: KlasaMessage) {
		const timer = new Stopwatch();
		await Promise.all(this.client.pieceStores.map(async (store) => {
			await store.loadAll();
			await store.init();
		}));

		if (this.client.shard) {
			await this.client.shard.broadcastEval(`
				if (String(this.shard.id) !== '${this.client.shard.ids}') this.pieceStores.map(async (store) => {
					await store.loadAll();
					await store.init();
				});
			`);
		}
		
		return message.sendLocale('COMMAND_RELOAD_EVERYTHING', [timer.stop()]);
	}
}
