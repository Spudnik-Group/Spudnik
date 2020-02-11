import { Command, KlasaClient, CommandStore, KlasaMessage, Stopwatch } from 'klasa';
import { join } from 'path';
import { pathExists } from 'fs-nextra';

/**
 * Loads a command.
 *
 * @export
 * @class LoadCommandCommand
 * @extends {Command}
 */
export default class LoadCommandCommand extends Command {
	private regExp = /\\\\?|\//g;

	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['l'],
			description: language => language.get('COMMAND_LOAD_DESCRIPTION'),
			guarded: true,
			hidden: true,
			permissionLevel: 10, // BOT OWNER
			usage: '[core] <Store:store> <path:...string>'
		});
	}

	/**
	 * Run the "LoadCommand" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {string} core
	 * @param {string} store
	 * @param {string} path
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof LoadCommandCommand
	 */
	public async run(message: KlasaMessage, [core, store, path]): Promise<KlasaMessage | KlasaMessage[]> {
		path = (path.endsWith('.js') ? path : `${path}.js`).split(this.regExp);
		const timer = new Stopwatch();
		const piece = await (core ? this.tryEach(store, path) : store.load(store.userDirectory, path));

		try {
			if (!piece) throw message.language.get('COMMAND_LOAD_FAIL');
			await piece.init();
			if (this.client.shard) {
				await this.client.shard.broadcastEval(`
					if (String(this.shard.id) !== '${this.client.shard.id}') {
						const piece = this.${piece.store}.load('${piece.directory}', ${JSON.stringify(path)});
						if (piece) piece.init();
					}
				`);
			}

			return message.sendLocale('COMMAND_LOAD', [timer.stop(), store.name, piece.name]);
		} catch (error) {
			timer.stop();
			throw message.language.get('COMMAND_LOAD_ERROR', store.name, piece ? piece.name : path.join('/'), error);
		}
	}

	private async tryEach(store: any, path: string) {
		for (const dir of store.coreDirectories) if (await pathExists(join(dir, ...path))) return store.load(dir, path);
		
		return undefined;
	}
}
