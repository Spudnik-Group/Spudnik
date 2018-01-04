const d20 = require('d20');

module.exports = Spudnik => {
	return {
		commands: [
			'roll'
		],
		roll: {
			usage: '[# of sides] or [# of dice]d[# of sides]( + [# of dice]d[# of sides] + ...)',
			description: 'roll one die with x sides, or multiple dice using d20 syntax. Default value is 10',
			process: (msg, suffix, isEdit, cb) => {
				if (suffix.split('d').length <= 1) {
					cb(`${msg.author} rolled a ${d20.roll(suffix || '10')}`, msg);
				} else if (suffix.split('d').length > 1) {
					const eachDie = suffix.split('+');
					let passing = 0;
					let response = '';
					for (let i = 0; i < eachDie.length; i++) {
						if (eachDie[i].split('d')[0] < 50) {
							passing += 1;
						}
					}
					if (passing === eachDie.length) {
						response = `${msg.author} rolled a ${d20.roll(suffix)}`;
					} else {
						response = `${msg.author} tried to roll too many dice at once!`;
					}

					cb({
						embed: {
							color: Spudnik.Config.defaultEmbedColor,
							description: `${response}`
						}
					}, msg);
				}
			}
		}
	};
};
