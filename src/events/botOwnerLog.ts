/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Event, Timestamp } from 'klasa';
import { SpudConfig } from '@lib/config';
import { TextChannel } from 'discord.js';
import { stripIndents } from 'common-tags';

export default class extends Event {

	public run(args: [string, any]): void {
		if (SpudConfig.botOwnerLogChannel) {
			const message = stripIndents`
				**${args[0]}**
				**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display()}
				${args[1]}
			`;
			const channel = this.client.channels.get(SpudConfig.botOwnerLogChannel) as TextChannel;
			// eslint-disable-next-line @typescript-eslint/no-floating-promises
			channel.send(message);
		}
	}

}
