/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Serializer, KlasaClient, SerializerStore, SchemaPiece, Language } from 'klasa';
import { Guild } from 'discord.js';

export default class TosMessage extends Serializer {

	constructor(client: KlasaClient, store: SerializerStore, file: string[], directory: string) {
		super(client, store, file, directory, { aliases: ['tosmessage'] })
	}

	deserialize(data: any, piece: SchemaPiece, language: Language, guild: Guild) {
		return JSON.parse(data);
	}

	serialize(value) {
		return JSON.stringify(value);
	}

	stringify(value) {
		return value;
	}
};