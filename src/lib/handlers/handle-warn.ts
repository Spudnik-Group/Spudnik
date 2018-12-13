import * as Rollbar from 'rollbar';

export function handleWarn(err: Error, rollbar: Rollbar) {
	if (process.env.NODE_ENV !== 'development') rollbar.warn(err);
	console.warn(err);
}
