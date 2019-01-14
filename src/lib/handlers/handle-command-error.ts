export function handleCommandError(cmd: any, err: Error) {
	if (process.env.spud_debug) {
		console.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
	}
}