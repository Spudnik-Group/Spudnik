import { stripIndents } from 'common-tags';
import { Message } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
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
	constructor(client: CommandoClient) {
		super(client, {
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
	 * @param {CommandoMessage} msg
	 * @param {{ choices: string[] }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof ChooseCommand
	 */
	public async run(msg: CommandoMessage, args: { choices: string[] }): Promise<Message | Message[]> {
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
