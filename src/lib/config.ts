import * as fs from 'fs';
import { JsonConvert, JsonObject, JsonProperty } from 'json2typescript';

const configObj: object = JSON.parse(fs.readFileSync('./config/config.json', 'utf8'));
const jsonConvert: JsonConvert = new JsonConvert();

interface IConfig {
	getDebug(): boolean;
	getDatabaseConnection(): string;
	getToken(): string;
	getOwner(): string;
	getBreweryDbApiKey(): string;
	getDictionaryApiKey(): string;
}

@JsonObject
export class Configuration implements IConfig {
	@JsonProperty('debug', Boolean)
	private _debug: boolean = false;

	@JsonProperty('mongoDb', String)
	private _mongoDb: string = '';

	@JsonProperty('token', String)
	private _token: string = '';

	@JsonProperty('owner', String)
	private _owner: string = '';

	@JsonProperty('breweryDbApiKey', String)
	private _breweryDbApiKey: string = '';

	@JsonProperty('dictionaryApiKey', String)
	private _dictionaryApiKey: string = '';

	public getDebug() {
		return this._debug;
	}
	public getDatabaseConnection() {
		return this._mongoDb;
	}
	public getToken() {
		return this._token;
	}
	public getOwner() {
		return this._owner;
	}
	public getBreweryDbApiKey() {
		return this._breweryDbApiKey;
	}
	public getDictionaryApiKey() {
		return this._dictionaryApiKey;
	}

	protected setDebug(debug: boolean) {
		this._debug = debug;
	}
	protected setDatabaseConnection(mongoDb: string) {
		this._mongoDb = mongoDb;
	}
	protected setToken(token: string) {
		this._token = token;
	}
	protected setOwner(owner: string) {
		this._owner = owner;
	}
	protected setBreweryDbApiKey(breweryDbApiKey: string) {
		this._breweryDbApiKey = breweryDbApiKey;
	}
	protected setDictionaryApiKey(dictionaryApiKey: string) {
		this._dictionaryApiKey = dictionaryApiKey;
	}
}

export const Config: Configuration = jsonConvert.deserializeObject(configObj, Configuration);
