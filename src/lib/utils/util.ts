/**
 * Copyright (c) 2020 Spudnik Group
 */

// TODO: add jsdoc
export function createPick<T>(array: T[]): () => T {
	const { length } = array;

	return (): any => array[Math.floor(Math.random() * length)];
}

// TODO: add jsdoc
export const Convert = {
	base64decode: (s: string): string => Buffer.from(s, 'base64').toString('utf8'),
	base64encode: (s: string): string => Buffer.from(s).toString('base64'),
	bin2dec: (s: string): string => parseInt(s, 2).toString(10),
	bin2hex: (s: string): string => parseInt(s, 2).toString(16),
	dec2bin: (s: string): string => parseInt(s, 10).toString(2),
	dec2hex: (s: string): string => parseInt(s, 10).toString(16),
	hex2bin: (s: string): string => parseInt(s, 16).toString(2),
	hex2dec: (s: string): string => parseInt(s, 16).toString(10)
};

// TODO: add jsdoc
export const isNormalInteger = (str: string): boolean => {
	const n = Math.floor(Number(str));

	return String(n) === str && n >= 0;
};

/**
 * Generate a random integer, from supplied min and max values.
 *
 * @export
 * @param {number} min
 * @param {number} max
 * @returns number
 */
export const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

// TODO: add jsdoc
export const getBytes = (bytes: number): string => {
	const suffixes = ['Bytes', 'KB', 'MB'];
	const i = Math.floor(Math.log(bytes) / Math.log(1024));

	return (!bytes && '0 Bytes') || `${(bytes / Math.pow(1024, i)).toFixed(2)} ${suffixes[i]}`;
};

/**
 * Returns a timeout as a promise.
 *
 * @export
 * @param {number} ms
 * @returns Promise<any>
 */
export const delay = (ms: number): Promise<any> => new Promise((resolve: any) => setTimeout(resolve, ms));

/**
 * Returns a shuffled version of the supplied array.
 *
 * @export
 * @param  {any[]} array
 * @returns any[]
 */
export const shuffle = (array: any[]): any[] => {
	const arr = array.slice(0);

	for (let i = arr.length - 1; i >= 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = arr[i];
		arr[i] = arr[j];
		arr[j] = temp;
	}

	return arr;
};

/**
 * Returns a string of values from a supplied array.
 *
 * @param  {any[]} arr
 * @param  {} conj='and'
 * @returns string
 */
export const list = (arr: any[], conj: string = 'and'): string => {
	const len = arr.length;

	return `${arr.slice(0, -1).join(', ')}${len > 1 ? `${len > 2 ? ',' : ''} ${conj} ` : ''}${arr.slice(-1)}`;
};

/**
 * Returns a shortened version of the supplied string, appended with an ellipses.
 *
 * @param  {string} text
 * @param  {} maxLen=2000
 * @returns string
 */
export const shorten = (text: string, maxLen: number = 2000): string => text.length > maxLen ? `${text.substr(0, maxLen - 3)}...` : text;

/**
 * Returns a formatted duration from a supplied number.
 *
 * @param  {number} ms
 * @returns string
 */
export const duration = (ms: number): string => {
	const sec = Math.floor((ms / 1000) % 60).toString();
	const min = Math.floor((ms / (1000 * 60)) % 60).toString();
	const hrs = Math.floor(ms / (1000 * 60 * 60)).toString();

	return `${hrs.padStart(2, '0')}:${min.padStart(2, '0')}:${sec.padStart(2, '0')}`;
};

/**
 * Returns a trimmed array.
 *
 * @param  {any[]} arr
 * @param  {} maxLen=10
 * @returns any
 */
export const trimArray = (arr: any[], maxLen: number = 10): any[] => {
	if (arr.length > maxLen) {
		const len = arr.length - maxLen;
		arr = arr.slice(0, maxLen);
		arr.push(`${len} more...`);
	}

	return arr;
};

/**
 * Returns a cryptographic hash of the supplied text.
 *
 * @param {string} text
 * @param {string} algorithm
 * @returns string
 */
export const hash = (text: string, algorithm: string): string => require('crypto').createHash(algorithm).update(text)
	.digest('hex');

/**
 * Returns the beginning of the current day.
 *
 * @param {number} timeZone
 * @returns Date
 */
export const today = (timeZone: number): Date => {
	const now = new Date();

	if (timeZone) {
		now.setUTCHours(now.getUTCHours() + timeZone);
	}

	now.setHours(0);
	now.setMinutes(0);
	now.setSeconds(0);
	now.setMilliseconds(0);

	return now;
};

/**
 * @param  {any[]} items
 * @param  {string} label
 * @param  {} property='name'
 * @returns string
 */
export const disambiguation = (items: any[], label: string, property: string = 'name'): string => {
	const itemList = items.map((item: any) => `"${(property ? item[property] : item).replace(/ /g, '\xa0')}"`).join(',   ');

	return `Multiple ${label} found, please be more specific: ${itemList}`;
};

/**
 * Returns the beginning of the next day.
 *
 * @param  {number} timeZone
 * @returns Date
 */
export const tomorrow = (timeZone: number): Date => {
	const thisDate = today(timeZone);
	thisDate.setDate(thisDate.getDate() + 1);

	return thisDate;
};
