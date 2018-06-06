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
	getDblApiKey(): string;
	getHbApiKey(): string;
	getStatusUpdateInterval(): number;
	getBotListUpdateInterval(): number;
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

	@JsonProperty('dblApiKey', String)
	private _dblApiKey: string = '';

	@JsonProperty('honeybadgerApiKey', String)
	private _honeybadgerApiKey: string = '';

	@JsonProperty('botListUpdateInterval', Number)
	private _botListUpdateInterval: number = 0;

	@JsonProperty('statusUpdateInterval', Number)
	private _statusUpdateInterval: number = 0;

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
	 * Get the dbl API key
	 *
	 * @returns {string}
	 * @memberof Configuration
	 */
	public getDblApiKey() {
		return this._dblApiKey;
	}

	/**
	 * Get the Honeybadger API key
	 *
	 * @returns {string}
	 * @memberof Configuration
	 */
	public getHbApiKey() {
		return this._honeybadgerApiKey;
	}

	/**
	 * Get the status update interval
	 *
	 * @returns {number}
	 * @memberof Configuration
	 */
	public getStatusUpdateInterval() {
		return this._statusUpdateInterval;
	}

	/**
	 * Get the bot list update interval
	 *
	 * @returns {number}
	 * @memberof Configuration
	 */
	public getBotListUpdateInterval() {
		return this._botListUpdateInterval;
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

	/**
	 * Set the dbl API key.
	 *
	 * @protected
	 * @param {string} dblApiKey
	 * @memberof Configuration
	 */
	protected setDblApiKey(dblApiKey: string) {
		this._dblApiKey = dblApiKey;
	}

	/**
	 * Set the Honeybadger API key.
	 *
	 * @protected
	 * @param {string} honeybadgerApiKey
	 * @memberof Configuration
	 */
	protected setHbApiKey(honeybadgerApiKey: string) {
		this._honeybadgerApiKey = honeybadgerApiKey;
	}

	/**
	 * Set the status update interval
	 *
	 * @protected
	 * @param {number} statusUpdateInterval
	 * @memberof Configuration
	 */
	protected setStatusUpdateInterval(statusUpdateInterval: number) {
		this._statusUpdateInterval = statusUpdateInterval;
	}

	/**
	 * Set the bot list update interval
	 *
	 * @protected
	 * @param {number} botListUpdateInterval
	 * @memberof Configuration
	 */
	protected setBotListUpdateInterval(botListUpdateInterval: number) {
		this._botListUpdateInterval = botListUpdateInterval;
	}
}

export const Config: Configuration = jsonConvert.deserializeObject(configObj, Configuration);
