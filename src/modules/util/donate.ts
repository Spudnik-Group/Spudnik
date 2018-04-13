import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';

export default class DonateCommand extends Command {
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Donate to help support the ongoing hosting and development of the bot.',
			group: 'util',
			guildOnly: true,
			memberName: 'donate',
			name: 'donate',
			throttling: {
				duration: 3,
				usages: 2,
			},
		});
	}

	public async run(msg: CommandMessage): Promise<Message | Message[]> {
		return sendSimpleEmbeddedMessage(msg, "We'd love your help supporting the community!\nYou can donate here: <https://www.paypal.me/nebula>\nsend bitcoin to: `1PxwKxJiDdhpX14YKjGfwsPUberN8aK5Ka`\nsend Ethereum to: `0x02c83E52f8018612da24012B3953E7AF6b805c30`");
	}
}
