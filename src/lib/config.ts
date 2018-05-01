import * as fs from 'fs';
import { JsonConvert, JsonObject, JsonProperty } from 'json2typescript';

const configObj: object = JSON.parse(fs.readFileSync('./config/config.json', 'utf8'));
const jsonConvert: JsonConvert = new JsonConvert();

interface IConfig {
	getDebug(): boolean;
	getDatabaseConnection(): string;
	getToken(): string;
	getOwner(): string[];
	getBreweryDbApiKey(): string;
	getDictionaryApiKey(): string;
}

/**
 * Holds the configuration for a bot instance.
 *
 * @export
 * @class Configuration
 * @implements {IConfig}
 */
@JsonObject
export class Configuration implements IConfig {
	@JsonProperty('debug', Boolean)
	private _debug: boolean = false;

	@JsonProperty('mongoDb', String)
	private _mongoDb: string = '';

	@JsonProperty('token', String)
	private _token: string = '';

	@JsonProperty('owner', [String])
	private _owner: string[] = [];

	@JsonProperty('breweryDbApiKey', String)
	private _breweryDbApiKey: string = '';

	@JsonProperty('dictionaryApiKey', String)
	private _dictionaryApiKey: string = '';

	/**
	 * Get the debug flag.
	 *
	 * @returns {boolean}
	 * @memberof Configuration
	 */
	public getDebug() {
		return this._debug;
	}

	/**
	 * Get the database connection.
	 *
	 * @returns {string}
	 * @memberof Configuration
	 */
	public getDatabaseConnection() {
		return this._mongoDb;
	}

	/**
	 * Get the token.
	 *
	 * @returns {string}
	 * @memberof Configuration
	 */
	public getToken() {
		return this._token;
	}

	/**
	 * Get the owner.
	 *
	 * @returns {string[]}
	 * @memberof Configuration
	 */
	public getOwner() {
		return this._owner;
	}

	/**
	 * Get the brewerydb API key
	 *
	 * @returns {string}
	 * @memberof Configuration
	 */
	public getBreweryDbApiKey() {
		return this._breweryDbApiKey;
	}

	/**
	 * Get the dictionary API key
	 *
	 * @returns {string}
	 * @memberof Configuration
	 */
	public getDictionaryApiKey() {
		return this._dictionaryApiKey;
	}

	/**
	 * Set the debug flag.
	 *
	 * @protected
	 * @param {boolean} debug
	 * @memberof Configuration
	 */
	protected setDebug(debug: boolean) {
		this._debug = debug;
	}

	/**
	 * Set the database connection.
	 *
	 * @protected
	 * @param {string} mongoDb
	 * @memberof Configuration
	 */
	protected setDatabaseConnection(mongoDb: string) {
		this._mongoDb = mongoDb;
	}

	/**
	 * Set the token.
	 *
	 * @protected
	 * @param {string} token
	 * @memberof Configuration
	 */
	protected setToken(token: string) {
		this._token = token;
	}

	/**
	 * Set the owner.
	 *
	 * @protected
	 * @param {string[]} owner
	 * @memberof Configuration
	 */
	protected setOwner(owner: string[]) {
		this._owner = owner;
	}

	/**
	 * Set the brewerydb API key.
	 *
	 * @protected
	 * @param {string} breweryDbApiKey
	 * @memberof Configuration
	 */
	protected setBreweryDbApiKey(breweryDbApiKey: string) {
		this._breweryDbApiKey = breweryDbApiKey;
	}

	/**
	 * Set the dictionary API key.
	 *
	 * @protected
	 * @param {string} dictionaryApiKey
	 * @memberof Configuration
	 */
	protected setDictionaryApiKey(dictionaryApiKey: string) {
		this._dictionaryApiKey = dictionaryApiKey;
	}
}

export const Config: Configuration = jsonConvert.deserializeObject(configObj, Configuration);
