import { Event } from 'klasa';

export default class extends Event {

	run(message, command, params, error) {
		// TODO: change this
		// const message = stripIndents`
		// Caught **General Warning**!
		// **Time:** ${format(new Date(), 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
		// **Warning Message:** ${err}`;

		// if (process.env.spud_issuelog) {
		// 	const channel = client.channels.get(process.env.spud_issuelog) as TextChannel;
		// 	channel.send(message);
		// }

		if (error instanceof Error) this.client.emit('wtf', `[COMMAND] ${command.path}\n${error.stack || error}`);
		if (error.message) message.sendCode('JSON', error.message).catch(err => this.client.emit('wtf', err));
		else message.sendMessage(error).catch(err => this.client.emit('wtf', err));
	}

};
