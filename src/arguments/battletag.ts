/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Argument } from 'klasa';

export default class extends Argument {

	public run(tag: string): any {
		if (tag.match(/(\w{3,12})#(\d{4,5})/i)) return tag;

		throw 'Please provide a valid battletag in the format: `username#0000`';
	}

}
