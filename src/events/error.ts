/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Event, Timestamp } from 'klasa';
import * as Rollbar from 'rollbar';
import { SpudConfig } from '../lib/config/spud-config';
import { stripIndents } from 'common-tags';
import { TextChannel } from 'discord.js';

export default class extends Event {

	run(err) {
		if (process.env.NODE_ENV !== 'development') {
			const rollbar = new Rollbar({
				accessToken: SpudConfig.rollbarApiKey,
				captureUncaught: true,
				captureUnhandledRejections: true,
				environment: process.env.NODE_ENV
			});
			rollbar.error(err);
		}

		const message = stripIndents`
		Caught **Error**!
		**Time:** ${new Timestamp('MMMM D YYYY [at] HH:mm:ss [UTC]Z').display()}
		**Error Message:** ${err}`;

		if (SpudConfig.issueLogChannel) {
			const channel = this.client.channels.get(SpudConfig.issueLogChannel) as TextChannel;
			channel.send(message);
		}

		this.client.console.error(err);
	}

};
