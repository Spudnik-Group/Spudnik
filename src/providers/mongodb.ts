/*
 * Copyright (c) 2017-2019 dirigeants. All rights reserved. MIT license.
 */

const { Provider, util: { mergeDefault, mergeObjects, isObject } } = require('klasa');
const { MongoClient: Mongo } = require('mongodb');

export default class extends Provider {

	public db: any = undefined;

	constructor(...args: any) {
		super(...args, { description: 'Allows use of MongoDB functionality throughout Klasa' });
		this.db = null;
	}

	async init() {
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

	get exec() {
		return this.db;
	}

	hasTable(table: any) {
		return this.db.listCollections().toArray().then((collections: any) => collections.some((col: any) => col.name === table));
	}

	createTable(table: any) {
		return this.db.createCollection(table);
	}

	deleteTable(table: any) {
		return this.db.dropCollection(table);
	}

	/* Document methods */

	getAll(table: any, filter: any[] = []) {
		if (filter.length) return this.db.collection(table).find({ id: { $in: filter } }, { _id: 0 }).toArray();

		return this.db.collection(table).find({}, { _id: 0 }).toArray();
	}

	getKeys(table: any) {
		return this.db.collection(table).find({}, { id: 1, _id: 0 }).toArray();
	}

	get(table: any, id: any) {
		return this.db.collection(table).findOne(resolveQuery(id));
	}

	has(table: any, id: any) {
		return this.get(table, id).then(Boolean);
	}

	getRandom(table: any) {
		return this.db.collection(table).aggregate({ $sample: { size: 1 } });
	}

	create(table: any, id: any, doc = {}) {
		return this.db.collection(table).insertOne(mergeObjects(this.parseUpdateInput(doc), resolveQuery(id)));
	}

	delete(table: any, id: any) {
		return this.db.collection(table).deleteOne(resolveQuery(id));
	}

	update(table: any, id: any, doc: any) {
		return this.db.collection(table).updateOne(resolveQuery(id), { $set: isObject(doc) ? flatten(doc) : parseEngineInput(doc) });
	}

	replace(table: any, id: any, doc: any) {
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

const parseEngineInput = (updated: any) => Object.assign({}, ...updated.map((entry: any) => ({ [entry.data[0]]: entry.data[1] })));
