/*
 * Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.
 */

/* eslint-disable @typescript-eslint/no-use-before-define */
import { mergeDefault, mergeObjects, isObject } from 'klasa/src/lib/util/util';
import { Provider, ProviderStore } from 'klasa';
import { MongoClient as Mongo } from 'mongodb';

export default class extends Provider {

	public db: any = undefined;

	public constructor(store: ProviderStore, file: string[], directory: string) {
		super(store, file, directory);
		this.db = null;
	}

	public async init() {
		const connection = mergeDefault({
			db: 'klasa',
			host: 'localhost',
			options: {},
			port: 27017
		}, this.client.options.providers.mongodb);

		// If full connection string is provided, use that, otherwise fall back to individual parameters
		const connectionString = this.client.options.providers.mongodb.connectionString || `mongodb://${connection.user}:${connection.password}@${connection.host}:${connection.port}/${connection.db}`;

		const mongoClient = await Mongo.connect(
			connectionString,
			mergeObjects(connection.options, { useNewUrlParser: true, useUnifiedTopology: true })
		);

		this.db = mongoClient.db(connection.db);
	}

	/* Table methods */

	public get exec() {
		return this.db;
	}

	public hasTable(table: any) {
		return this.db.listCollections().toArray().then((collections: any) => collections.some((col: any) => col.name === table));
	}

	public createTable(table: any) {
		return this.db.createCollection(table);
	}

	public deleteTable(table: any) {
		return this.db.dropCollection(table);
	}

	/* Document methods */

	public getAll(table: any, filter: any[] = []) {
		if (filter.length) return this.db.collection(table).find({ id: { $in: filter } }, { _id: 0 }).toArray();

		return this.db.collection(table).find({}, { _id: 0 }).toArray();
	}

	public getKeys(table: any) {
		return this.db.collection(table).find({}, { id: 1, _id: 0 }).toArray();
	}

	public get(table: any, id: any) {
		return this.db.collection(table).findOne(resolveQuery(id));
	}

	public has(table: any, id: any) {
		return this.get(table, id).then(Boolean);
	}

	public getRandom(table: any) {
		return this.db.collection(table).aggregate({ $sample: { size: 1 } });
	}

	public create(table: any, id: any, doc = {}) {
		return this.db.collection(table).insertOne(mergeObjects(this.parseUpdateInput(doc), resolveQuery(id)));
	}

	public delete(table: any, id: any) {
		return this.db.collection(table).deleteOne(resolveQuery(id));
	}

	public update(table: any, id: any, doc: any) {
		return this.db.collection(table).updateOne(resolveQuery(id), { $set: isObject(doc) ? flatten(doc) : parseEngineInput(doc) });
	}

	public replace(table: any, id: any, doc: any) {
		return this.db.collection(table).replaceOne(resolveQuery(id), this.parseUpdateInput(doc));
	}

}

const resolveQuery = (query: any) => isObject(query) ? query : { id: query };

const flatten = (obj: any, path = '') => {
	let output: any = {};
	for (const [key, value] of Object.entries(obj)) {
		if (isObject(value)) output = Object.assign(output, flatten(value, path ? `${path}.${key}` : key));
		else output[path ? `${path}.${key}` : key] = value;
	}

	return output;
};

const parseEngineInput = (updated: any) => Object.assign({}, ...updated.map(({ entry, next }) => ({ [entry.path]: next })));
