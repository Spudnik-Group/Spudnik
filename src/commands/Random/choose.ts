import { getEmbedColor, getRandomInt, sendSimpleEmbeddedError } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';
import { MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';

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
			description: 'Have the bot choose something for you. Max 10 items.',
			extendedHelp: stripIndents`
				syntax: \`!choose <choices>\`

				The command takes an infinite number of space-separated arguements.
			`,
			name: 'choose',
			usage: '<choice:string> <choice:string> [...]',
			usageDelim: ', '
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
	public async run(msg: KlasaMessage, [choice]): Promise<KlasaMessage | KlasaMessage[]> {
		const options: string[] = choice;
		if (options.length < 2) {
			return sendSimpleEmbeddedError(msg, 'I can\'t choose for you if you don\'t give me more options!', 3000);
		}

		return msg.send(new MessageEmbed({
			author: {
				iconURL: msg.client.user.displayAvatarURL(),
				name: `${msg.client.user.username}`
			},
			color: getEmbedColor(msg),
			description: `I choose ${options[getRandomInt(0, options.length)]}`,
			title: ':thinking:'
		}), { reply: msg.author });
	}
}
