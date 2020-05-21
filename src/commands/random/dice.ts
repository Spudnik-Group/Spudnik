/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, KlasaMessage } from 'klasa';
import { MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import { baseEmbed } from '@lib/helpers/embed-helpers';

/**
 * Simulate dice rolling.
 *
 * @export
 * @class RollCommand
 * @extends {Command}
 */
export default class RollCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			aliases: ['roll'],
			description: 'Roll one die with x sides + any modifiers, with an optional reason.',
			extendedHelp: 'syntax: `!roll "[# of sides | [# of dice]d[# of sides]+modifiers]" [reason] >`',
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
	public async run(msg: KlasaMessage, [roll = 6, reason]: [string|number, string]): Promise<KlasaMessage | KlasaMessage[]> {
		const result = require('d20').roll(roll);
		const diceEmbed: MessageEmbed = baseEmbed(msg)
			.setTitle(':game_die: Dice Roller');

		if (!result) {
			return msg.sendSimpleError('Invalid roll attempt. Try again with d20 syntax or a valid number.');
		}
		diceEmbed.setDescription(stripIndents`
			Roll: ${roll}${reason
	? `

			For: ${reason.replace('for ', '')}`
	: ''}

			--
			Result: ${result}
		`);

		// Send the success response
		return msg.sendEmbed(diceEmbed, '', { reply: msg.author });
	}

}
