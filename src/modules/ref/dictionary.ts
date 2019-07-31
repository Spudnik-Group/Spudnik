import { stripIndents, oneLine } from 'common-tags';
import { Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor, deleteCommandMessages } from '../../lib/custom-helpers';
import { sendSimpleEmbeddedError, stopTyping, startTyping } from '../../lib/helpers';

const mw = require('mw-dict');
const dictionaryApiKey: string = process.env.spud_dictionaryapi;
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
			details: stripIndents`
				syntax: \`!define <word>\`
			`,
			examples: [
				'!define outstanding',
				'!define useful'
			],
			group: 'ref',
			guildOnly: true,
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
	 * @param {CommandoMessage} msg
	 * @param {{ query: string }} args
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof DefineCommand
	 */
	public async run(msg: CommandoMessage, args: { query: string }): Promise<Message | Message[]> {
		const word = args.query;
		const dictionaryEmbed: MessageEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			description: '',
			footer: {
				icon_url: 'http://www.dictionaryapi.com/images/info/branding-guidelines/mw-logo-light-background-50x50.png',
				text: 'powered by Merriam-Webster\'s Collegiate® Dictionary'
			},
			title: `Definition Result: ${word}`
		});

		startTyping(msg);

		try {
			const result = await dict.lookup(word)
			if (result[0].functional_label) {
				dictionaryEmbed.addField('Functional Label:', result[0].functional_label);
			}

			if (result[0].pronunciation[0]) {
				dictionaryEmbed.addField('Pronunciation:', result[0].pronunciation[0]);
			}

			if (result[0].etymology) {
				dictionaryEmbed.addField('Etymology:', result[0].etymology);
			}

			if (result[0].popularity) {
				dictionaryEmbed.addField('Popularity:', result[0].popularity);
			}

			dictionaryEmbed.description = this.renderDefinition(result[0].definition);

			deleteCommandMessages(msg);
			stopTyping(msg);

			// Send the success response
			return msg.embed(dictionaryEmbed);
		} catch (err) {
			msg.client.emit('warn', `Error in command ref:define: ${err}`);

			stopTyping(msg);

			return sendSimpleEmbeddedError(msg, 'Word not found.', 3000);
		}
	}

	private renderDefinition(sensesIn: any) {
		return sensesIn
			.map((def: any) => oneLine`
				${def.number ? '*' + def.number + '.*' : ''}
				${def.meanings && def.meanings.length ? def.meanings.join(' ') : ''}
				${def.synonyms && def.synonyms.length ? def.synonyms.map((s: any) => '_' + s + '_').join(', ') : ''}
				${def.illustrations && def.illustrations.length ? def.illustrations.map((i: any) => '* ' + i).join('\n') : ''}
				${def.senses && def.senses.length ? this.renderDefinition(def.senses) : ''}
			`)
			.join('\n');
	}
}
