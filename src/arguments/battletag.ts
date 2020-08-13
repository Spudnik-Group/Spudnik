/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Argument, Possible, KlasaMessage } from 'klasa';

export default class extends Argument {

	public run(arg: string, possible: Possible, message: KlasaMessage): any {
		if (arg.match(/(\w{3,12})#(\d{4,5})/i)) return arg;

		throw message.language.get('RESOLVER_INVALID_BATTLETAG', possible.name);
	}

}
