/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Serializer, KlasaClient, SerializerStore } from 'klasa';
import { IWarning } from '../lib/interfaces/warning';

export default class Warning extends Serializer {

	constructor(client: KlasaClient, store: SerializerStore, file: string[], directory: string) {
		super(client, store, file, directory)
	}

	deserialize(data: string, piece, language, guild) {
		return JSON.parse(JSON.stringify(data));
	}

	serialize(value: IWarning) {
		return JSON.stringify(value);
	}

	stringify(value) {
		return value;
	}
};