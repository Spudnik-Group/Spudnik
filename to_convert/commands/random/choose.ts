import { stripIndents } from 'common-tags';
import { Message } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor, deleteCommandMessages } from '../../lib/custom-helpers';
import { getRandomInt, sendSimpleEmbeddedError } from '../../lib/helpers';

/**
 * Post a random choice of 2 options.
 *
 * @export
 * @class ChooseCommand
 * @extends {Command}
 */
export default class ChooseCommand extends Command {
	/**
	 * Creates an instance of ChooseCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof ChooseCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			args: [
				{
					infinite: true,
					key: 'choices',
					prompt: 'What should I choose between?',
					type: 'string'
				}
			],
			description: 'Have the bot choose something for you.',
			details: stripIndents`
				syntax: \`!choose <choices>\`

				The command takes an infinite number of space-separated arguements.
			`,
			examples: ['!choose Chocolate Vanilla Strawberry NOTHING'],
			group: 'random',
			guildOnly: true,
			memberName: 'choose',
			name: 'choose',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "choose" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ choices: string[] }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof ChooseCommand
	 */
	public async run(msg: KlasaMessage, args: { choices: string[] }): Promise<KlasaMessage | KlasaMessage[]> {
		const options: string[] = args.choices;
		if (options.length < 2) {
			return sendSimpleEmbeddedError(msg, 'I can\'t choose for you if you don\'t give me more options!', 3000);
		}
		
		deleteCommandMessages(msg);
		
		return msg.reply({
			author: {
				iconURL: msg.client.user.displayAvatarURL(),
				name: `${msg.client.user.username}`
			},
			color: getEmbedColor(msg),
			description: `I choose ${options[getRandomInt(0, 1)]}`,
			title: ':thinking:'
		});
	}
}
