import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { getRandomInt, sendSimpleEmbededImage } from '../../lib/helpers';

// tslint:disable-next-line:no-var-requires
const { coinflip }: { coinflip: any[] } = require('../../extras/data');

export default class CoinFlipCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Flips a coin for you.',
			group: 'random',
			guildOnly: true,
			memberName: 'coinflip',
			name: 'coinflip',
			throttling: {
				duration: 3,
				usages: 2,
			},
		});
	}

	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		return sendSimpleEmbededImage(msg, coinflip[getRandomInt(0, 1)].image);
	}
}
