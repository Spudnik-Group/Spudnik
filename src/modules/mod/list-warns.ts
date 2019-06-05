import { stripIndents } from 'common-tags';
import { GuildMember, Message, MessageEmbed } from 'discord.js';
import { Command, CommandoMessage, CommandoClient } from 'discord.js-commando';
import Mongoose = require('mongoose');
import { Schema, Document, Model } from 'mongoose';
import { startTyping, stopTyping, sendSimpleEmbeddedError } from '../../lib/helpers';
import { getEmbedColor, deleteCommandMessages } from '../../lib/custom-helpers';
import * as format from 'date-fns/format';

interface IWarningsObject {
	id: string;
	tag: string;
	points: number;
}
interface IWarnings {
	guild: string;
	warnings: IWarningsObject[];
}
interface IWarningsModel extends IWarnings, Document { }

const warningsSchema: Schema = new Schema({
	guild: String,
	warnings: Array
});
const conn = Mongoose.createConnection(process.env.spud_mongo);
const warningModel: Model<IWarningsModel> = conn.model<IWarningsModel>('warning', warningsSchema);

/**
 * List warns for the guild.
 *
 * @export
 * @class ListWarnsCommand
 * @extends {Command}
 */
export default class ListWarnsCommand extends Command {
	/**
	 * Creates an instance of ListWarnsCommand.
	 *
	 * @param {CommandoClient} client
	 * @memberof ListWarnsCommand
	 */
	constructor(client: CommandoClient) {
		super(client, {
			aliases: [
				'list-warn',
                'warn-list',
                'warns'
			],
			description: 'List warns for the guild.',
			details: stripIndents`
				MANAGE_MESSAGES permission required.
			`,
			examples: [
				'!list-warns'
			],
			group: 'mod',
			guildOnly: true,
			memberName: 'list-warns',
			name: 'list-warns',
			throttling: {
				duration: 3,
				usages: 2
			},
			userPermissions: ['MANAGE_MESSAGES']
		});
	}

	/**
	 * Run the "list-warns" command.
	 *
	 * @param {CommandoMessage} msg
	 * @param {{ member: GuildMember, reason: string }} args
	 * @returns {(Promise<Message | Message[] | any>)}
	 * @memberof ListWarnsCommand
	 */
	public async run(msg: CommandoMessage, args: { member: GuildMember, reason: string }): Promise<Message | Message[] | any> {
		const warnEmbed: MessageEmbed = new MessageEmbed({
			author: {
				icon_url: 'https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/146/warning-sign_26a0.png',
				name: 'Warnings List'
			},
			color: getEmbedColor(msg),
			description: ''
		}).setTimestamp();

		startTyping(msg);

		// Check for guild's warnings
		warningModel.findOne({ guild: msg.guild.id }, (err: any, res: IWarningsModel) => {
			if (err) this.catchError(msg, args, err);
			if (res) {
				// Warnings present for current guild
				const warningsForCurrentGuild: IWarningsObject[] = res.warnings;
				// Build embed
				warningsForCurrentGuild.forEach(warning => {
					warnEmbed.description += stripIndents`

						**${warning.tag}** (${warning.id}) - ${warning.points} Points
					`;
				})

				deleteCommandMessages(msg);
				stopTyping(msg);
	
				// Send the success response
				return msg.embed(warnEmbed);
			} else {
				// No document for current guild
				deleteCommandMessages(msg);
				stopTyping(msg);
	
				return sendSimpleEmbeddedError(msg, 'No warnings present.');
			}
		});
	}
	
	private catchError(msg: CommandoMessage, args: { member: GuildMember, reason: string }, err: Error) {
		// Emit warn event for debugging
		msg.client.emit('warn', stripIndents`
		Error occurred in \`list-warns\` command!
		**Server:** ${msg.guild.name} (${msg.guild.id})
		**Author:** ${msg.author.tag} (${msg.author.id})
		**Time:** ${format(msg.createdTimestamp, 'MMMM Do YYYY [at] HH:mm:ss [UTC]Z')}
		**Error Message:** ${err}`);

		// Inform the user the command failed
		stopTyping(msg);
		
		return sendSimpleEmbeddedError(msg, `Getting warnings for ${msg.guild.name} failed!`, 3000);
	}
}
