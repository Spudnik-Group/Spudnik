export const SpudConfig = {
	'bfdApiKey': process.env.spud_bfdapi ? process.env.spud_bfdapi : '',
	'bodApiKey': process.env.spud_bodapi ? process.env.spud_bodapi : '',
	'botListGuilds': process.env.spud_botlist_guilds ? process.env.spud_botlist_guilds.split(',') : [],
	'botListUpdateInterval': process.env.spud_botlist_update_interval ? +process.env.spud_botlist_update_interval : 600000,
	'botsggApiKey': process.env.spud_botsggapi ? process.env.spud_botsggapi : '',
	'dbApiKey': process.env.spud_dbapi ? process.env.spud_dbapi : '',
	'dblApiKey': process.env.spud_dblapi ? process.env.spud_dblapi : '',
	'debug': process.env.spud_debug ? !!process.env.spud_debug : false,
	'owner': process.env.spud_owner.split(','),
	'rollbarApiKey': process.env.spud_rollbarapi ? process.env.spud_rollbarapi : '',
	'spudCoreDB': process.env.SPUD_CORE_DB ? process.env.SPUD_CORE_DB : process.env.spud_mongo,
	'spudStatsDB': process.env.SPUD_STATS_DB ? process.env.SPUD_STATS_DB : process.env.spud_mongo,
	'statusUpdateInterval': process.env.spud_status_update_interval ? +process.env.spud_status_update_interval : 600000,
	'token': process.env.spud_token
}
