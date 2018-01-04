module.exports = Spudnik => {
	if (Spudnik.startTime === undefined) {
		Spudnik.startTime = Date.now();
	}

	return {
		commands: [
			'log',
			'uptime'
		],
		log: {
			usage: '<log message>',
			description: 'logs message to bot console',
			process: msg => {
				console.log(msg.content);
			}
		},
		uptime: {
			usage: '<command>',
			description: 'returns the amount of time since the bot started',
			process: (msg, suffix, isEdit, cb) => {
				const now = Date.now();
				let msec = now - Spudnik.startTime;
				console.log(`Uptime is ${msec} milliseconds`);
				const days = Math.floor(msec / 1000 / 60 / 60 / 24);
				msec -= days * 1000 * 60 * 60 * 24;
				const hours = Math.floor(msec / 1000 / 60 / 60);
				msec -= hours * 1000 * 60 * 60;
				const mins = Math.floor(msec / 1000 / 60);
				msec -= mins * 1000 * 60;
				const secs = Math.floor(msec / 1000);
				let timestr = '';
				if (days > 0) {
					timestr += `${days} days `;
				}
				if (hours > 0) {
					timestr += `${hours} hours `;
				}
				if (mins > 0) {
					timestr += `${mins} minutes `;
				}
				if (secs > 0) {
					timestr += `${secs} seconds `;
				}
				cb({
					embed: {
						color: Spudnik.Config.defaultEmbedColor,
						description: `**Uptime**: ${timestr}`
					}
				}, msg);
			}
		}
	};
};
