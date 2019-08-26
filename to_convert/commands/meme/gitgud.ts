import { stripIndents } from 'common-tags';
import { GuildMember, Message } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { deleteCommandMessages } from '../../lib/custom-helpers';

/**
 * Post the "gitgud" image at someone.
 *
 * @export
 * @class GitGudCommand
 * @extends {Command}
 */
export default class GitGudCommand extends Command {
	/**
	 * Creates an instance of GitGudCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof GitGudCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			args: [
				{
					default: '',
					key: 'mention',
					prompt: 'Who should gitgud?',
					type: 'member'
				}
			],
			description: 'Informs someone that they should "git gud".',
			details: stripIndents`
				syntax: \`!gitgud (@user mention)\`
			`,
			examples: ['!gitgud', '!gitgud @Nebula#1337'],
			group: 'meme',
			guildOnly: true,
			memberName: 'gitgud',
			name: 'gitgud',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "gitgud" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ mention: GuildMember }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof GitGudCommand
	 */
	public async run(msg: KlasaMessage, args: { mention: GuildMember }): Promise<KlasaMessage | KlasaMessage[]> {
		const gitgudImageURL = 'http://i.imgur.com/NqpPXHu.jpg';

		if (args.mention && args.mention !== null) {
			deleteCommandMessages(msg);

			return msg.embed({ image: { url: gitgudImageURL } }, '', {
				reply: args.mention
			});
		} else {
			deleteCommandMessages(msg);

			return msg.embed({ image: { url: gitgudImageURL } });
		}
	}
}
