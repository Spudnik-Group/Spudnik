import { stripIndents } from 'common-tags';
import { GuildMember, Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { deleteCommandMessages } from 'src/lib/helpers';

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
	constructor(client: CommandoClient) {
		super(client, {
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
			group: 'random',
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
	 * @param {CommandMessage} msg
	 * @param {{ mention: GuildMember }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof GitGudCommand
	 */
	public async run(msg: CommandMessage, args: { mention: GuildMember }): Promise<Message | Message[]> {
		const gitgudImageURL = 'http://i.imgur.com/NqpPXHu.jpg';

		if (args.mention && args.mention !== null) {
			deleteCommandMessages(msg, this.client);

			return msg.embed({ image: { url: gitgudImageURL } }, '', {
				reply: args.mention
			});
		} else {
			deleteCommandMessages(msg, this.client);

			return msg.embed({ image: { url: gitgudImageURL } });
		}
	}
}
