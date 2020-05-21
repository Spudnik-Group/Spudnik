/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Event, Timestamp } from 'klasa';
import Rollbar from 'rollbar';
import { SpudConfig } from '@lib//config/spud-config';
import { stripIndents } from 'common-tags';
import { TextChannel } from 'discord.js';

export default class extends Event {

	public run(failure: any): void {
		if (process.env.NODE_ENV !== 'development') {
			const rollbar = new Rollbar({
				accessToken: SpudConfig.rollbarApiKey,
				captureUncaught: true,
				captureUnhandledRejections: true,
				environment: process.env.NODE_ENV
			});
			rollbar.critical(failure);
		}

		const message = stripIndents`
		Caught **BIG FAILURE**!
		**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display()}
		**Error Message:** ${failure}`;

		if (SpudConfig.issueLogChannel) {
			const channel = this.client.channels.get(SpudConfig.issueLogChannel) as TextChannel;
			// eslint-disable-next-line @typescript-eslint/no-floating-promises
			channel.send(message);
		}

		this.client.console.wtf(failure);
	}

}
