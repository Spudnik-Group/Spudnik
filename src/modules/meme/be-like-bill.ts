import { stripIndents } from 'common-tags';
import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { deleteCommandMessages } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedImage } from '../../lib/helpers';

/**
 * Returns the "Be Like Bill" meme with optional details.
 *
 * @export
 * @class BeLikeBillCommand
 * @extends {Command}
 */
export default class BeLikeBillCommand extends Command {
	/**
	 * Creates an instance of BeLikeBillCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof BeLikeBillCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					default: 'm',
					key: 'gender',
					prompt: 'What gender?',
					type: 'string',
					validate: (gender: string) => {
						const allowed = [ 'female', 'male', 'f', 'm' ];
						if (allowed.indexOf(gender.toLowerCase()) !== -1) return true;
						
						return 'You provided an invalid gender. Valid options: "m", "f", "female", "male"';
					}
				}
			],
			description: 'Returns the "Be Like Bill" meme with optional details.',
			details: stripIndents`
				syntax: \`!be-like-bill (male|female)\`
			`,
			examples: ['!be-like-bill', '!be-like-bill f'],
			group: 'meme',
			guildOnly: true,
			memberName: 'be-like-bill',
			name: 'be-like-bill',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "be-like-bill" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ mention: GuildMember }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof BeLikeBillCommand
	 */
	public async run(msg: CommandoMessage, args: { gender: string }): Promise<Message | Message[]> {
		let qs: string = `default=1&name=${msg.member.displayName}`
		if (args.gender) {
			qs += `&gender=${args.gender}`;
		}
	
		deleteCommandMessages(msg);

		return sendSimpleEmbeddedImage(msg, `https://belikebill.ga/billgen-API.php?${qs}`);
	}
}
