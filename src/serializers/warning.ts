/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Serializer } from 'klasa';
import { IWarning } from '../lib/interfaces/warning';

export default class extends Serializer {

	public deserialize(data: string): IWarning {
		return JSON.parse(JSON.stringify(data));
	}

	public serialize(value: IWarning): any {
		return JSON.parse(JSON.stringify(value));
	}

	public stringify(value: IWarning): string {
		return value.id;
	}

}
