import { Client } from 'klasa';

Client.defaultGuildSchema
	.add('warnings', 'any', { array: true })
	.add('commands', folder => folder
		.add('deleteMessages', 'boolean')
		.add('disabled', 'string', { array: true })
		.add('disabledCategories', 'string', { array: true }))
	.add('roles', folder => folder
		.add('default', 'Role')
		.add('muted', 'Role')
		.add('selfAssignable', 'Role', { array: true }))
	.add('starboard', folder => folder
		.add('enabled', 'boolean')
		.add('channel', 'TextChannel')
		.add('trigger', 'string', { 'default': '⭐' }))
	.add('welcome', folder => folder
		.add('enabled', 'boolean')
		.add('channel', 'TextChannel')
		.add('message', 'string', { 'default': '@here, please Welcome {user} to {guild}!' }))
	.add('goodbye', folder => folder
		.add('enabled', 'boolean')
		.add('channel', 'TextChannel')
		.add('message', 'string', { 'default': '{user} has left the server.' }))
	.add('modlog', folder => folder
		.add('initialMessageSent', 'boolean')
		.add('channel', 'TextChannel')
		.add('enabled', 'boolean'))
	.add('tos', folder => folder
		.add('channel', 'TextChannel')
		.add('messages', 'any', { array: true }))
	.add('embedColor', 'string', { 'default': '555555' })
	.add('adblockEnabled', 'boolean');
