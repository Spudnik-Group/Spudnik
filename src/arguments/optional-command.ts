/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Argument, ArgumentStore, Possible, KlasaMessage } from 'klasa';

export default class extends Argument {

	public constructor(store: ArgumentStore, file: string[], directory: string) {
		super(store, file, directory, { aliases: ['optional-command'] });
	}

	public run(arg: string, possible: Possible, message: KlasaMessage): any {
		if (!arg) return; // allow no input
		const command = this.client.commands.get(arg.toLowerCase());
		if (command) return command;
		throw message.language.get('RESOLVER_INVALID_PIECE', possible.name, 'command');
	}

}
