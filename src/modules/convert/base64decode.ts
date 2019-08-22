import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { Convert } from '../../lib/convert';
import { getEmbedColor, deleteCommandMessages } from '../../lib/custom-helpers';

/**
 * Base64 decodes a string
 *
 * @export
 * @class Base64DecodeCommand
 * @extends {Command}
 */
export default class Base64DecodeCommand extends Command {
	/**
	 * Creates an instance of Base64DecodeCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof Base64DecodeCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'stringToDecode',
					prompt: 'Please enter a valid base64 encoded string.\n',
					type: 'string',
					validate: (stringToDecode: string) => {
						return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(stringToDecode);
					}
				}
			],
			description: 'Base64 decodes a string',
			examples: [
				'!base64decode c29tZXRoaW5n'
			],
			group: 'convert',
			guildOnly: true,
			memberName: 'base64decode',
			name: 'base64decode',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "base64decode" command.
	 *
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof Base64DecodeCommand
	 */
	public async run(msg: CommandoMessage, args: { stringToDecode: string }): Promise<Message | Message[]> {
		const returnMessage = new MessageEmbed({
			author: {
				name: 'Base64 Decoded String:'
			},
			color: getEmbedColor(msg)
		});

		const fields: any = [];

		fields.push({
			inline: false,
			name: 'Input:',
			value: `${args.stringToDecode}`
		});

		fields.push({
			inline: false,
			name: 'Output:',
			value: `${Convert.base64decode(args.stringToDecode)}`
		});

		returnMessage.fields = fields;

		deleteCommandMessages(msg);
		
		return msg.embed(returnMessage);
	}
}
