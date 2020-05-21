/**
 * Copyright (c) 2020 Spudnik Group
 */

// Tslint:disable
export const SpudConfig = {
	token: process.env.SPUD_TOKEN,
	port: process.env.PORT || 1337,
	owners: process.env.SPUD_OWNERS ? process.env.SPUD_OWNERS.split(',') : [],
	spudCoreDB: process.env.SPUD_CORE_DB,
	spudCoreDBConnection: process.env.SPUD_CORE_DB_CONNECTION,
	spudStatsDB: process.env.SPUD_STATS_DB,
	spudStatsDBConnection: process.env.SPUD_STATS_DB_CONNECTION,
	botListGuilds: process.env.SPUD_BOTLIST_GUILDS ? process.env.SPUD_BOTLIST_GUILDS.split(',') : [],
	botListUpdateInterval: process.env.SPUD_BOTLIST_UPDATE_INTERVAL || '0 10,22 * * *',
	statusUpdateInterval: process.env.SPUD_STATUS_UPDATE_INTERVAL || '* * * * *',
	debug: process.env.SPUD_DEBUG ? Boolean(process.env.SPUD_DEBUG) : false,
	rollbarApiKey: process.env.SPUD_ROLLBARAPI || '',
	issueLogChannel: process.env.SPUD_ISSUELOG || '',
	botOwnerLogChannel: process.env.SPUD_OWNERLOG || '',
	// Command-Specific API Keys
	wolframApiKey: process.env.SPUD_WOLFRAMAPI || '',
	tmdbAPIkey: process.env.SPUD_MOVIEDBAPI || '',
	dictionaryApiKey: process.env.SPUD_DICTIONARYAPI || '',
	breweryDbApiKey: process.env.SPUD_BREWDBAPI || '',
	stackoverflowApiKey: process.env.SPUD_STACKOVERFLOWAPI || '',
	// Bot List API Keys
	bfdApiKey: process.env.SPUD_BFDAPI || '',
	bodApiKey: process.env.SPUD_BODAPI || '',
	botsggApiKey: process.env.SPUD_BOTSGGAPI || '',
	dbApiKey: process.env.SPUD_DBAPI || '',
	dblApiKey: process.env.SPUD_DBLAPI || ''
};
