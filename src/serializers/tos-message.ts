/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Serializer } from 'klasa';

export default class extends Serializer {

	public deserialize(data: any): any {
		return JSON.parse(data);
	}

	public serialize(value: any): string {
		return JSON.stringify(value);
	}

	public stringify(value: any): any {
		return value;
	}

}
