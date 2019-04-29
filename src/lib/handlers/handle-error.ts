import * as Rollbar from 'rollbar';
import { Configuration } from '../spudnik';

export const handleError = (err: Error, config: Configuration) => {
	if (!config.debug && process.env.NODE_ENV !== 'development') {
		const rollbar = new Rollbar({
			accessToken: config.rollbarApiKey,
			captureUncaught: true,
			captureUnhandledRejections: true,
			environment: process.env.NODE_ENV
		});
		rollbar.error(err);
	}
	
	console.error(err);
}
