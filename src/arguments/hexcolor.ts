/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Argument } from 'klasa';

export default class extends Argument {

	public run(arg: string): any {
		if (!arg) return; // allow no input
		if (RegExp(/^#(?:[0-9A-Fa-f]{3}){1,2}$/i).test(arg)) {
			return arg;
		}

		throw 'Please provide a valid color hex number.';
	}

}
