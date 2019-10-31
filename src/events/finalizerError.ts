import { Event } from 'klasa';

export default class extends Event {

	run(message, command, response, timer, finalizer, error) {
		// TODO: change this
		// const message = stripIndents`
		// Caught **General Warning**!
		// **Time:** ${format(new Date(), 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
		// **Warning Message:** ${err}`;

		// if (process.env.spud_issuelog) {
		// 	const channel = client.channels.get(process.env.spud_issuelog) as TextChannel;
		// 	channel.send(message);
		// }

		this.client.emit('wtf', `[FINALIZER] ${finalizer.path}\n${error ?
			error.stack ? error.stack : error : 'Unknown error'}`);
	}

};
