import { stripIndents } from 'common-tags';
import { Message } from 'discord.js';
import * as rp from 'request-promise';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage, startTyping, stopTyping } from '../../lib/helpers';
import { deleteCommandMessages } from '../../lib/custom-helpers';

/**
 * Generates a Strawpoll with the provided options.
 *
 * @export
 * @class StrawpollCommand
 * @extends {Command}
 */
export default class StrawpollCommand extends Command {
	/**
	 * Creates an instance of StrawpollCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof StrawpollCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['poll'],
			args: [
				{
					key: 'title',
					max: 200,
					prompt: 'What would you like the title of the Strawpoll to be?',
					type: 'string'
				},
				{
					infinite: true,
					key: 'options',
					max: 10,
					prompt: 'What options do you want to be able to pick from? You may have a maximum of 10.',
					type: 'string'
				}
			],
			description: 'Generates a Strawpoll with the provided options.',
			examples: [
				'!strawpoll'
			],
			group: 'misc',
			guildOnly: true,
			memberName: 'strawpoll',
			name: 'strawpoll',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "strawpoll" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ title: string, options: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof StrawpollCommand
	 */
	public async run(msg: CommandoMessage, args: { title: string, options: string }): Promise<Message | Message[]> {
		startTyping(msg);

		return rp.post({
			body: {
				captcha: true,
				options: args.options,
				title: args.title
			},
			json: true,
			uri: 'https://www.strawpoll.me/api/v2/polls'
		})
			.then((res: any) => {
				deleteCommandMessages(msg);
				stopTyping(msg);
				
				return sendSimpleEmbeddedMessage(msg, stripIndents`
					${res.title}
					http://www.strawpoll.me/${res.id}
				`);
			})
			.catch((err: Error) => {
				msg.client.emit('warn', `Error in command misc:strawpoll: ${err}`);

				deleteCommandMessages(msg);
				stopTyping(msg);
				
				return sendSimpleEmbeddedError(msg, 'There was an error with the request. Try again?', 3000);
			});
	}
}