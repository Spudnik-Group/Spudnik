export function handleCommandError(cmd: any, err: Error) {
	if (this.Config.debug) {
		console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
	}
}