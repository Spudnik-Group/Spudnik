import { Serializer, KlasaClient, SerializerStore } from 'klasa';
import { IWarning } from '../lib/interfaces/Warning';

export default class Warning extends Serializer {

	constructor(client: KlasaClient, store: SerializerStore, file: string[], directory: string) {
		super(client, store, file, directory)
    }

	deserialize(data: string, piece, language, guild) {
        return JSON.parse(data);
    }

	serialize(value: IWarning) {
        return JSON.stringify(value);
    }
};