/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Argument, ArgumentStore, Possible, KlasaMessage } from 'klasa';

export default class extends Argument {

	public constructor(store: ArgumentStore, file: string[], directory: string) {
		super(store, file, directory, { aliases: ['optional-user'] });
	}

	public async run(arg: string, possible: Possible, message: KlasaMessage): Promise<any> {
		if (!arg) return; // allow no input
		const user = RegExp(Argument.regex.userOrMember).test(arg) ? await this.client.users.fetch(RegExp(Argument.regex.userOrMember).exec(arg)[1]).catch(() => null) : null;
		if (user) return user;
		throw message.language.get('RESOLVER_INVALID_USER', possible.name);
	}

}
