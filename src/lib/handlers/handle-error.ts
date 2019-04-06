import * as Rollbar from 'rollbar';

export const handleError = (err: Error, rollbar: Rollbar) => {
	if (process.env.NODE_ENV !== 'development') rollbar.error(err);
	
	console.error(err);
}
