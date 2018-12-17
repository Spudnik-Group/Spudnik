import { CommandoClient } from 'discord.js-commando';
import { TextChannel } from 'discord.js';
import { stripIndents } from 'common-tags';
import * as moment from 'moment';

export function handleWarn(err: Error, client: CommandoClient) {
	const channel = client.channels.get(process.env.spud_issuelog) as TextChannel;
	const message = stripIndents`
	Caught **General Warning**!
	**Time:** ${moment().format('MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
	**Warning Message:** ${err}`;

	channel.send(message);
	console.warn(message);
};
