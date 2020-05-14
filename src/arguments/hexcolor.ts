/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Argument } from 'klasa';

export default class extends Argument {

	public run(arg: string): any {
		if (!arg) return; // allow no input
		if (RegExp(/^#([A-Fa-f0-9]{6})$/i).test(arg)) {
			return arg;
		}

		throw 'Please provide a valid color hex number.';
	}

}
