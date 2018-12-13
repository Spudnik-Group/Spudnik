export function handleDebug(err: Error) {
	if (this.Config.debug) {
		console.info(err);
	}
}
