/**
 * Copyright (c) 2020 Spudnik Group
 */

export const Convert = {
	base64decode: (s: string): string => Buffer.from(s, 'base64').toString('utf8'),
	base64encode: (s: string): string => Buffer.from(s).toString('base64'),
	bin2dec : (s: string): string => parseInt(s, 2).toString(10),
	bin2hex : (s: string): string => parseInt(s, 2).toString(16),
	dec2bin : (s: string): string => parseInt(s, 10).toString(2),
	dec2hex : (s: string): string => parseInt(s, 10).toString(16),
	hex2bin : (s: string): string => parseInt(s, 16).toString(2),
	hex2dec : (s: string): string => parseInt(s, 16).toString(10)
};
