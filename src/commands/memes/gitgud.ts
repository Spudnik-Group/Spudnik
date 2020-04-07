/**
 * Copyright (c) 2020 Spudnik Group
 */

import { Command, CommandStore, KlasaMessage } from 'klasa';
import { baseEmbed } from '@lib/helpers/embed-helpers';
import { GuildMember } from 'discord.js';

/**
 * Post the "gitgud" image at someone.
 *
 * @export
 * @class GitGudCommand
 * @extends {Command}
 */
export default class GitGudCommand extends Command {

	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Informs someone that they should "git gud".',
			name: 'gitgud',
			usage: '[mention:member]'
		});
	}

	/**
	 * Run the "gitgud" command.
	 *
	 * @param {KlasaMessage} msg
	 * @param {{ mention: GuildMember }} args
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof GitGudCommand
	 */
	public async run(msg: KlasaMessage, [mention]: [GuildMember]): Promise<KlasaMessage | KlasaMessage[]> {
		const gitgudImageURL = 'http://i.imgur.com/NqpPXHu.jpg';

		if (mention && mention !== null) {
			return msg.sendEmbed(baseEmbed(msg).setImage(gitgudImageURL), '', {
				reply: mention
			});
		}

		return msg.sendSimpleImage(null, gitgudImageURL);
	}

}
