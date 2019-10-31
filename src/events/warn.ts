import { Event } from 'klasa';
import * as Rollbar from 'rollbar';
import { SpudConfig } from '../lib/config/spud-config';

export default class extends Event {

	run(warning) {
		if (!SpudConfig.debug && process.env.NODE_ENV !== 'development') {
			const rollbar = new Rollbar({
				accessToken: SpudConfig.rollbarApiKey,
				captureUncaught: true,
				captureUnhandledRejections: true,
				environment: process.env.NODE_ENV
			});
			rollbar.warn(warning);
		}

		this.client.console.warn(warning);
	}

};
