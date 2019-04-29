import { CommandoClient } from 'discord.js-commando';

export const handleDisconnected = (err: Error, client: CommandoClient) => {
	if (process.env.NODE_ENV !== 'development') client.emit('error', `Disconnected from Discord!\nError: ${err}`);

	process.exit();
}
