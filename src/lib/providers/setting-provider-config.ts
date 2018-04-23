import { JsonObject, JsonProperty } from 'json2typescript';

interface ISettingProviderConfig {
	getConnection(): string;
	getOptions(): object;
}

/**
 * Holds configuration values for settings.
 * 
 * @export
 * @class SettingProviderConfig
 * @implements {ISettingProviderConfig}
 */
@JsonObject
export class SettingProviderConfig implements ISettingProviderConfig {
	@JsonProperty('connection', String)
	private _connection: string = '';

	@JsonProperty('options', [Object])
	private _options: object = {};

	/**
	 * Get the connection.
	 * 
	 * @returns {string}
	 * @memberof SettingProviderConfig
	 */
	public getConnection() {
		return this._connection;
	}

	/**
	 * Get the options.
	 * 
	 * @returns {object}
	 * @memberof SettingProviderConfig
	 */
	public getOptions() {
		return this._options;
	}

	/**
	 * Set the connection.
	 * 
	 * @protected
	 * @param {string} connection 
	 * @memberof SettingProviderConfig
	 */
	protected setConnection(connection: string) {
		this._connection = connection;
	}

	/**
	 * Set the options.
	 * 
	 * @protected
	 * @param {object} options 
	 * @memberof SettingProviderConfig
	 */
	protected setOptions(options: object) {
		this._options = options;
	}
}
