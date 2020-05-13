/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Argument, ArgumentStore, Possible, KlasaMessage } from 'klasa';

export default class extends Argument {

	public constructor(store: ArgumentStore, file: string[], directory: string) {
		super(store, file, directory, { aliases: ['optional-channel'] });
	}

	public async run(arg: string, possible: Possible, message: KlasaMessage): Promise<any> {
		if (!arg) return; // allow no input
		// Regular Channel support
		const channel = RegExp(Argument.regex.channel).test(arg) ? await this.client.channels.fetch(RegExp(Argument.regex.channel).exec(arg)[1]).catch(() => null) : null;
		if (channel) return channel;
		// DM Channel support
		const user = RegExp(Argument.regex.userOrMember).test(arg) ? await this.client.users.fetch(RegExp(Argument.regex.userOrMember).exec(arg)[1]).catch(() => null) : null;
		if (user) return user.createDM();
		throw message.language.get('RESOLVER_INVALID_CHANNEL', possible.name);
	}

}
