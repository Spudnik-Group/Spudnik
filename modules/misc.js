const unshort = require('unshort');

module.exports = Spudnik => {
	return {
		commands: [
			'lmgtfy',
			'unshorten',
			'ping',
			'say'
		],
		lmgtfy: {
			usage: '<Let Me Google that for You>',
			description: 'Plebs, plz.',
			process: (msg, suffix, isEdit, cb) => {
				if (suffix) {
					cb(`<http://lmgtfy.com/?q=${encodeURI(require('remove-markdown')(suffix))}>`, msg, false, true);
				}
			}
		},
		unshorten: {
			usage: '<link to shorten>',
			description: 'Unshorten a link.',
			process: (msg, suffix, isEdit, cb) => {
				if (suffix) {
					unshort(suffix, (err, url) => {
						if (url) {
							cb(`Original url is: ${url}`, msg);
						} else {
							cb('This url can\'t be expanded', msg);
							if (Spudnik.config.debug) {
								console.log(err);
							}
						}
					});
				}
			}
		},
		ping: {
			description: 'responds pong, useful for checking if bot is alive',
			process: (msg, suffix, isEdit, cb) => {
				cb(`${msg.author} pong!`, msg);
			}
		},
		say: {
			usage: '<message>',
			description: 'bot says message',
			process: (msg, suffix, isEdit, cb) => {
				cb(suffix, msg);
			}
		}
	};
};
