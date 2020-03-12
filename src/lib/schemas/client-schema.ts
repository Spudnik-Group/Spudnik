import { Client } from 'klasa';

Client.defaultClientSchema
	.add('blacklist', folder => folder
		.add('guilds', 'guild', { array: true })
		.add('users', 'user', { array: true }));
