/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Argument } from 'klasa';

export default class extends Argument {

	public run(arg: string): any {
		if (!arg) return;
		if (!isNaN(RegExp(/^ *[a-f0-9]{6} *$/i).test(arg) ? parseInt(arg, 16) : NaN)) {
			return arg;
		}

		throw 'Please provide a valid color hex number.';
	}

}
