import { oneLine } from 'common-tags';
import { Message } from 'discord.js';
import { Command, CommandMessage, CommandoClient } from 'discord.js-commando';
import { Config } from '../../lib/config';
import { getEmbedColor } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, sendSimpleEmbeddedMessage } from '../../lib/helpers';

// tslint:disable-next-line:no-var-requires
const mw = require('mw-dict');
const dictionaryApiKey: string = Config.getDictionaryApiKey();
const dict = new mw.CollegiateDictionary(dictionaryApiKey);

/**
 * Post the definition of a word.
 *
 * @export
 * @class DefineCommand
 * @extends {Command}
 */
export default class DefineCommand extends Command {
	/**
	 * Creates an instance of DefineCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof DefineCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			args: [
				{
					key: 'query',
					prompt: 'What should I look up in the dictionary?\n',
					type: 'string'
				}
			],
			description: 'Returns the definition of a supplied word. Uses the Merriam-Webster Collegiate Dictionary API.',
			details: oneLine`
				syntax: \`!define <word>\`
			`,
			examples: [
				'!define outstanding',
				'!define useful'
			],
			group: 'ref',
			memberName: 'define',
			name: 'define',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "define" command.
	 *
	 * @param {CommandMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof DefineCommand
	 */
	public async run(msg: CommandMessage, args: { query: string }): Promise<Message | Message[]> {
		const response = await sendSimpleEmbeddedMessage(msg, 'Loading...');
		const word = args.query;

		dict.lookup(word)
			.then((result: any) => {
				console.dir(result);
			})
			.catch((err: any) => {
				msg.client.emit('warn', `Error in command ref:define: ${err}`);
				return sendSimpleEmbeddedError(msg, 'Word not found.', 3000);
			});

		return response;
	}
}
/*
[{
	word: 'delicious',
	functional_label: 'adjective',
	pronunciation: ['http://media.merriam-webster.com/soundc11/d/delici01.wav'],
	etymology: 'Middle English, from Middle French, from Late Latin [deliciosus,] from Latin [deliciae] delights, from [delicere] to allure',
	definition: [[Object], [Object]],
	popularity: 'Top 30% of words'
},
	{
		word: 'Delicious',
		functional_label: 'noun',
		pronunciation: [],
		etymology: '',
		definition: [[Object]]
	},
	{
		word: 'Red Delicious',
		functional_label: 'noun',
		pronunciation: [],
		etymology: '',
		definition: [[Object]]
	} */
