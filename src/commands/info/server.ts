/**
 * Copyright (c) 2020 Spudnik Group
 */

import { MessageEmbed, Channel } from 'discord.js';
import { getEmbedColor } from '../../lib/helpers';
import { Command, KlasaClient, CommandStore, KlasaMessage, Timestamp } from 'klasa';

const filterLevels = ['Off', 'No Role', 'Everyone'];
const verificationLevels = ['None', 'Low', 'Medium', '(╯°□°）╯︵ ┻━┻', '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻'];

/**
 * Returns statistics about the server.
 *
 * @export
 * @class ServerCommand
 * @extends {Command}
 */
export default class ServerCommand extends Command {
	constructor(client: KlasaClient, store: CommandStore, file: string[], directory: string) {
		super(client, store, file, directory, {
			aliases: ['server-stats'],
			description: 'Returns statistics about the server.',
			name: 'server'
		});
	}

	/**
	 * Run the "server" command.
	 *
	 * @param {KlasaMessage} msg
	 * @returns {(Promise<KlasaMessage | KlasaMessage[]>)}
	 * @memberof ServerCommand
	 */
	public async run(msg: KlasaMessage): Promise<KlasaMessage | KlasaMessage[]> {
		let serverEmbed: MessageEmbed = new MessageEmbed()
			.setColor(getEmbedColor(msg))
			.setDescription('**Server Statistics**')
			.setThumbnail(msg.guild.iconURL({ format: 'png' }))
			.addField('❯ Name', msg.guild.name, true)
			.addField('❯ ID', msg.guild.id, true)
			.addField('❯ Region', msg.guild.region.toUpperCase(), true)
			.addField('❯ Creation Date', new Timestamp('MM/DD/YYYY h:mm A').display(msg.guild.createdAt), true)
			.addField('❯ Explicit Filter', filterLevels[msg.guild.explicitContentFilter], true)
			.addField('❯ Verification Level', verificationLevels[msg.guild.verificationLevel], true)
			.addField('❯ Owner', msg.guild.owner.user.tag, true)
			.addField('❯ Members', msg.guild.memberCount, true)
			.addField('❯ Roles', msg.guild.roles.size, true)
			.addField('❯ Channels', msg.guild.channels.filter((channel: Channel) => channel.type !== 'category').size, true);
		
		return msg.sendEmbed(serverEmbed);
	}
}
