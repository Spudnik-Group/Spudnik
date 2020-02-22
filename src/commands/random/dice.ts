/**
 * Copyright (c) 2020 Spudnik Group
 */

import { getEmbedColor, sendSimpleEmbeddedError } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage } from 'klasa';
import { MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';

/**
 * Simulate dice rolling.
 *
 * @export
 * @class RollCommand
 * @extends {Command}
 */
export default class RollCommand extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			description: 'Roll one die with x sides + any modifiers, with an optional reason.',
			extendedHelp: 'syntax: `!roll "[# of sides | [# of dice]d[# of sides]+modifiers]" [reason] >`',
			name: 'roll',
			usage: '[roll:string] [reason:...string]'
		});
	}

	/**
	 * Run the "roll" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ rolls: string[] }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof RollCommand
	 */
	public async run(msg: KlasaMessage, [roll = 6, reason]): Promise<KlasaMessage | KlasaMessage[]> {
		const result = require('d20').roll(roll);
		const diceEmbed: MessageEmbed = new MessageEmbed({
			color: getEmbedColor(msg),
			description: '',
			title: ':game_die: Dice Roller'
		});

		if (!result) {
			return sendSimpleEmbeddedError(msg, 'Invalid roll attempt. Try again with d20 syntax or a valid number.');
		}
		diceEmbed.description = stripIndents`
			Roll: ${roll}${reason ? `

			For: ${reason.replace('for ', '')}` : ''}

			--
			Result: ${result}
		`;

		// Send the success response
		return msg.sendEmbed(diceEmbed, '', { reply: msg.author });
	}
}
