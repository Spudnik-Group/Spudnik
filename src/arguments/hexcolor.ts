/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Argument, Possible, KlasaMessage } from 'klasa';

export default class extends Argument {

	public run(arg: string, possible: Possible, message: KlasaMessage): any {
		if (!arg) return; // allow no input
		if (RegExp(/^#([A-Fa-f0-9]{6})$/i).test(arg)) {
			return arg;
		}

		throw message.language.get('RESOLVER_INVALID_HEXCOLOR', possible.name);
	}

}
