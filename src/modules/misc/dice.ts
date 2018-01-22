import { Message } from 'discord.js';
import { Spudnik } from '../spudnik';

//tslint:disable-next-line
const d20 = require('d20');

module.exports = (Spudnik: Spudnik) => {
	return {
		commands: [
			'roll',
		],
		// tslint:disable:object-literal-sort-keys
		roll: {
			usage: '[# of sides] or [# of dice]d[# of sides]( + [# of dice]d[# of sides] + ...)',
			description: 'roll one die with x sides, or multiple dice using d20 syntax. Default value is 10',
			process: (msg: Message, suffix: string) => {
				if (suffix.split('d').length <= 1) {
					return Spudnik.processMessage(`${msg.author} rolled a ${d20.roll(suffix || '10')}`, msg, false, false);
				} else if (suffix.split('d').length > 1) {
					const eachDie = suffix.split('+');
					let passing = 0;
					let response = '';
					for (const i in eachDie) {
						if (+eachDie[i].split('d')[0] < 50) {
							passing += 1;
						}
					}
					if (passing === eachDie.length) {
						response = `${msg.author} rolled a ${d20.roll(suffix)}`;
					} else {
						response = `${msg.author} tried to roll too many dice at once!`;
					}

					return Spudnik.processMessage(Spudnik.defaultEmbed(`${response}`), msg, false, false);
				}
			},
		},
	};
};
