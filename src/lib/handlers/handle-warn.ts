import { CommandoClient } from 'discord.js-commando';
import { TextChannel } from 'discord.js';
import { stripIndents } from 'common-tags';
import * as format from 'date-fns/format';

export const handleWarn = (err: Error, client: CommandoClient) => {
	const message = stripIndents`
	Caught **General Warning**!
	**Time:** ${format(new Date(), 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
	**Warning Message:** ${err}`;
	
	if (process.env.spud_issuelog) {
		const channel = client.channels.get(process.env.spud_issuelog) as TextChannel;
		channel.send(message);
	}

	console.warn(message);
}
