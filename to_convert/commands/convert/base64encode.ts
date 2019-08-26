import { Message, MessageEmbed } from 'discord.js';
import { Command, KlasaMessage, CommandoClient } from 'discord.js-commando';
import { Convert } from '../../lib/convert';
import { getEmbedColor, deleteCommandMessages } from '../../lib/custom-helpers';

/**
 * Base64 encodes a string
 *
 * @export
 * @class Base64EncodeCommand
 * @extends {Command}
 */
export default class Base64EncodeCommand extends Command {
	/**
	 * Creates an instance of Base64EncodeCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof Base64EncodeCommand
	 */
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			args: [
				{
					key: 'stringToEncode',
					prompt: 'What do you want to encode?\n',
					type: 'string'
				}
			],
			description: 'Base64 encodes a string',
			examples: [
				'!base64encode something'
			],
			group: 'convert',
			guildOnly: true,
			memberName: 'base64encode',
			name: 'base64encode',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "base64encode" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof Base64EncodeCommand
	 */
	public async run(msg: KlasaMessage, args: { stringToEncode: string }): Promise<KlasaMessage | KlasaMessage[]> {
		const returnMessage = new MessageEmbed({
			author: {
				name: 'Base64 Encoded String:'
			},
			color: getEmbedColor(msg)
		});

		const fields: any = [];

		fields.push({
			inline: false,
			name: 'Input:',
			value: `${args.stringToEncode}`
		});

		fields.push({
			inline: false,
			name: 'Output:',
			value: `${Convert.base64encode(args.stringToEncode)}`
		});

		returnMessage.fields = fields;

		deleteCommandMessages(msg);

		return msg.embed(returnMessage);
	}
}
