import { Message, MessageEmbed, Channel } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import { getEmbedColor } from '../../lib/custom-helpers';
import * as format from 'date-fns/format';
import { deleteCommandMessages } from '../../lib/helpers';

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
	/**
	 * Creates an instance of ServerCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof ServerCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: ['server-stats'],
			description: 'Returns statistics about the server.',
			examples: [
				'!server',
				'!server-stats'
			],
			group: 'util',
			guildOnly: true,
			memberName: 'server',
			name: 'server',
			throttling: {
				duration: 3,
				usages: 2
			}
		});
	}

	/**
	 * Run the "server" command.
	 *
	 * @param {CommandoMessage} msg
	 * @returns {(Promise<Message | Message[]>)}
	 * @memberof ServerCommand
	 */
	public async run(msg: CommandoMessage): Promise<Message | Message[]> {
		let serverEmbed: MessageEmbed = new MessageEmbed()
			.setColor(getEmbedColor(msg))
			.setDescription('**Server Statistics**')
			.setThumbnail(msg.guild.iconURL({ format: 'png' }))
			.addField('❯ Name', msg.guild.name, true)
			.addField('❯ ID', msg.guild.id, true)
			.addField('❯ Region', msg.guild.region.toUpperCase(), true)
			.addField('❯ Creation Date', format(msg.guild.createdAt, 'MM/DD/YYYY h:mm A'), true)
			.addField('❯ Explicit Filter', filterLevels[msg.guild.explicitContentFilter], true)
			.addField('❯ Verification Level', verificationLevels[msg.guild.verificationLevel], true)
			.addField('❯ Owner', msg.guild.owner.user.tag, true)
			.addField('❯ Members', msg.guild.memberCount, true)
			.addField('❯ Roles', msg.guild.roles.size, true)
			.addField('❯ Channels', msg.guild.channels.filter((channel: Channel) => channel.type !== 'category').size, true);
		
		deleteCommandMessages(msg, this.client);
		
		return msg.embed(serverEmbed);
	}
}
