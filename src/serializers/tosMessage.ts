import { Serializer, KlasaClient, SerializerStore } from 'klasa';

export default class TosMessage extends Serializer {

	constructor(client: KlasaClient, store: SerializerStore, file: string[], directory: string) {
		super(client, store, file, directory)
    }

	deserialize(data, piece, language, guild) {
        return JSON.parse(data);
    }

    serialize(value) {
        return JSON.stringify(value);
    }
};