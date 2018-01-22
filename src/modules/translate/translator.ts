import { Message } from 'discord.js';
import { Spudnik } from '../spudnik';

// tslint:disable-next-line
const soap = require('soap');
// tslint:disable-next-line
const leet = require('leet');

module.exports = (Spudnik: Spudnik) => {
	return {
		commands: [
			'leet',
			'yodify',
		],
		// tslint:disable:object-literal-sort-keys
		leet: {
			usage: '<message>',
			description: 'converts boring regular text to 1337',
			process: (msg: Message, suffix: string) => {
				Spudnik.processMessage(leet.convert(suffix), msg, false, false);
			},
		},
		yodify: {
			usage: '<statement>',
			description: 'Translate to Yoda speak',
			process: (msg: Message, suffix: string) => {
				if (!suffix) {
					return Spudnik.processMessage('Your statement, I must have.', msg, false, false);
				}

				soap.createClient('http://www.yodaspeak.co.uk/webservice/yodatalk.php?wsdl', (err: Error, client: any) => {
					if (err) {
						return Spudnik.processMessage('Lost, I am. Not found, the web service is. Hrmm...', msg, false, false);
					}

					client.yodaTalk({ inputText: suffix }, (err: Error, result: any) => {
						if (err) {
							return Spudnik.processMessage('Confused, I am. Disturbance in the force, there is. Hrmm...', msg, false, false);
						}
						return Spudnik.processMessage(result.return, msg, false, false);
					});
				});
			},
		},
	};
};
