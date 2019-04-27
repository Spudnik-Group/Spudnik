import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';
import { deleteCommandMessages } from '../../lib/custom-helpers';
import { stripIndents } from 'common-tags';

/**
 * Post links to upvote the bot's listings.
 *
 * @export
 * @class UpVoteCommand
 * @extends {Command}
 */
export default class UpVoteCommand extends Command {
	/**
	 * Creates an instance of UpVoteCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof UpVoteCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			description: 'Returns links to upvote the bot on bot listing sites.',
			examples: ['!upvote'],
			group: 'default',
			guarded: true,
			guildOnly: true,
			memberName: 'upvote',
			name: 'upvote',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "upvote" command.
	 *
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof UpVoteCommand
	 */
	public async run(msg: CommandoMessage): Promise<Message | Message[]> {
		deleteCommandMessages(msg);
		
		return sendSimpleEmbeddedMessage(msg, stripIndents`UPVOTE THIS BOT FOR THE MOTHERLAND!
			* [bots.ondiscord.xyz](https://bots.ondiscord.xyz/bots/398591330806398989)
			* [discord.bots.gg](https://discord.bots.gg/bots/398591330806398989)
			* [botsfordiscord.com](https://botsfordiscord.com/bot/398591330806398989)
			* [discordbotlist.com](https://discordbotlist.com/bots/398591330806398989)
			* [discordbots.org](https://discordbots.org/bot/398591330806398989)`);
	}
}
