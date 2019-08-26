import { Message } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedMessage } from '../../lib/helpers';
import { deleteCommandMessages } from '../../lib/custom-helpers';
import { stripIndents } from 'common-tags';

/**
 * Post links to upvote the bot's listings.
 *
 * @export
 * @class UpvoteCommand
 * @extends {Command}
 */
export default class UpvoteCommand extends Command {
	/**
	 * Creates an instance of UpvoteCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof UpvoteCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
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
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof UpvoteCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		deleteCommandMessages(msg);
		
		return sendSimpleEmbeddedMessage(msg, stripIndents`UPVOTE THIS BOT FOR THE MOTHERLAND!
			* [bots.ondiscord.xyz](https://bots.ondiscord.xyz/bots/398591330806398989)
			* [discord.bots.gg](https://discord.bots.gg/bots/398591330806398989)
			* [botsfordiscord.com](https://botsfordiscord.com/bot/398591330806398989)
			* [discordbotlist.com](https://discordbotlist.com/bots/398591330806398989)
			* [discordbots.org](https://discordbots.org/bot/398591330806398989)`);
	}
}
