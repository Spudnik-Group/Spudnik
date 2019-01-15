export function handleDebug(err: Error) {
	if (process.env.spud_debug) {
		console.info(err);
	}
}
