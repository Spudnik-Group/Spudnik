/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Base64 } from 'js-base64';

export const Convert = {
	base64decode: (s: string): string => Base64.decode(s),
	base64encode: (s: string): string => Base64.encode(s),
	bin2dec: (s: string): string => parseInt(s, 2).toString(10),
	bin2hex: (s: string): string => parseInt(s, 2).toString(16),
	dec2bin: (s: string): string => parseInt(s, 10).toString(2),
	dec2hex: (s: string): string => parseInt(s, 10).toString(16),
	hex2bin: (s: string): string => parseInt(s, 16).toString(2),
	hex2dec: (s: string): string => parseInt(s, 16).toString(10)
};
