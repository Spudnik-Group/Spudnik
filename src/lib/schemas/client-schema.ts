import { Client, SchemaFolder } from 'klasa';

Client.defaultClientSchema
	.add('blacklist', (folder: SchemaFolder) => folder
		.add('guilds', 'string', { array: true })
		.add('users', 'string', { array: true }));
