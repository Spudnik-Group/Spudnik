import { Client, SchemaFolder } from 'klasa';

Client.defaultClientSchema
	.add('blacklist', (folder: SchemaFolder) => folder
		.add('guilds', 'guild', { array: true })
		.add('users', 'user', { array: true }));
